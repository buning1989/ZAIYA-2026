#!/usr/bin/env python3
import argparse
from pathlib import Path

import cv2
import numpy as np


def parse_args():
    parser = argparse.ArgumentParser(description="Remove a clean light background and write RGBA PNG frames.")
    parser.add_argument("input", type=Path)
    parser.add_argument("frames_dir", type=Path)
    parser.add_argument("--max-frames", type=int, default=0)
    parser.add_argument("--low", type=float, default=7.5)
    parser.add_argument("--high", type=float, default=30.0)
    return parser.parse_args()


def estimate_background(frame):
    h, w = frame.shape[:2]
    pad = max(12, min(h, w) // 35)
    border = np.concatenate(
        [
            frame[:pad, :, :].reshape(-1, 3),
            frame[-pad:, :, :].reshape(-1, 3),
            frame[:, :pad, :].reshape(-1, 3),
            frame[:, -pad:, :].reshape(-1, 3),
        ],
        axis=0,
    )
    return np.median(border, axis=0).astype(np.uint8)


def keep_main_component(mask):
    count, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, 8)
    if count <= 1:
        return mask

    h, w = mask.shape
    center_x = w / 2.0
    best_label = 0
    best_score = -1.0
    for label in range(1, count):
        area = stats[label, cv2.CC_STAT_AREA]
        if area < max(600, h * w * 0.002):
            continue

        cx, cy = centroids[label]
        centrality = 1.0 - min(abs(cx - center_x) / center_x, 1.0)
        bottom_penalty = 0.35 if cy > h * 0.87 else 0.0
        score = area * (0.75 + centrality) * (1.0 - bottom_penalty)
        if score > best_score:
            best_label = label
            best_score = score

    if best_label == 0:
        best_label = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))

    return np.where(labels == best_label, 255, 0).astype(np.uint8)


def make_alpha(frame, low, high):
    bg = estimate_background(frame)
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB).astype(np.float32)
    bg_lab = cv2.cvtColor(bg.reshape(1, 1, 3), cv2.COLOR_BGR2LAB).reshape(3).astype(np.float32)
    bg_hsv = cv2.cvtColor(bg.reshape(1, 1, 3), cv2.COLOR_BGR2HSV).reshape(3).astype(np.float32)

    delta = lab - bg_lab
    dist = np.sqrt((delta[:, :, 0] * 0.75) ** 2 + (delta[:, :, 1] * 1.25) ** 2 + (delta[:, :, 2] * 1.25) ** 2)

    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    saturation = hsv[:, :, 1].astype(np.float32)
    value = hsv[:, :, 2].astype(np.float32)
    bg_value = float(np.median(value[: max(8, frame.shape[0] // 40), :]))

    # On neutral light backgrounds, saturation helps recover cream/fuzzy edges.
    # On saturated chroma backgrounds, saturation belongs to the background, so use color distance only.
    if bg_hsv[1] < 45:
        score = np.maximum(dist, np.maximum((bg_value - value) * 0.7, saturation * 0.2))
    else:
        score = dist
    alpha = np.clip((score - low) / (high - low), 0, 1) * 255
    alpha = alpha.astype(np.uint8)

    rough = np.where(alpha > 18, 255, 0).astype(np.uint8)
    kernel_open = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    rough = cv2.morphologyEx(rough, cv2.MORPH_OPEN, kernel_open)
    rough = cv2.morphologyEx(rough, cv2.MORPH_CLOSE, kernel_close)
    rough = keep_main_component(rough)

    support = cv2.dilate(rough, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19)), iterations=1)
    alpha = np.where(support > 0, alpha, 0).astype(np.uint8)
    alpha = cv2.GaussianBlur(alpha, (0, 0), 1.4)
    core = (rough > 0) & (alpha > 95)
    alpha = np.where(core, np.maximum(alpha, 220), alpha).astype(np.uint8)
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.8)

    # Remove faint floor shadow while preserving the opaque feet/body.
    yy = np.indices(alpha.shape)[0]
    neutral_lab = (lab[:, :, 1] > 122) & (lab[:, :, 1] < 142) & (lab[:, :, 2] > 122) & (lab[:, :, 2] < 158)
    floor_shadow = (yy > frame.shape[0] * 0.70) & (saturation < 62) & (value > 184) & neutral_lab & (alpha < 110)
    alpha = np.where(floor_shadow, 0, alpha).astype(np.uint8)
    return alpha, bg


def decontaminate_background(frame, alpha, bg):
    hsv_bg = cv2.cvtColor(bg.reshape(1, 1, 3), cv2.COLOR_BGR2HSV).reshape(3)
    if hsv_bg[1] < 45:
        return frame

    rgb = frame.astype(np.float32)
    bgf = bg.astype(np.float32).reshape(1, 1, 3)
    a = (alpha.astype(np.float32) / 255.0)[:, :, None]
    safe_a = np.clip(a, 0.08, 1.0)

    restored = (rgb - bgf * (1.0 - safe_a)) / safe_a
    restored = np.clip(restored, 0, 255)

    edge_strength = np.clip((1.0 - a) * 1.8, 0, 1)
    edge_strength *= (a > 0.03) & (a < 0.98)
    cleaned = rgb * (1.0 - edge_strength) + restored * edge_strength

    hsv_clean = cv2.cvtColor(np.clip(cleaned, 0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
    hue_delta = np.abs(hsv_clean[:, :, 0] - hsv_bg[0])
    hue_delta = np.minimum(hue_delta, 180 - hue_delta)

    spill = (alpha > 0) & (alpha < 252) & (hue_delta < 20) & (hsv_clean[:, :, 1] > 20)
    hsv_clean[:, :, 1] = np.where(spill, hsv_clean[:, :, 1] * 0.12, hsv_clean[:, :, 1])
    cleaned = cv2.cvtColor(np.clip(hsv_clean, 0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)

    # Chroma-key shadows are often tinted by the blue/green floor. Keep the soft contact
    # shadow, but make it neutral so it can sit on other backgrounds.
    yy = np.indices(alpha.shape)[0]
    shadow = (yy > frame.shape[0] * 0.64) & (alpha > 10) & (hue_delta < 24)
    if np.any(shadow):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY).astype(np.float32)
        neutral = np.dstack([gray, gray, gray])
        cleaned = np.where(shadow[:, :, None], neutral, cleaned)

    return cleaned.astype(np.uint8)


def main():
    args = parse_args()
    cap = cv2.VideoCapture(str(args.input))
    if not cap.isOpened():
        raise SystemExit(f"Could not open {args.input}")

    args.frames_dir.mkdir(parents=True, exist_ok=True)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    print(f"input_frames={frame_count} fps={fps:.3f}")

    index = 0
    written = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if args.max_frames and written >= args.max_frames:
            break

        alpha, bg = make_alpha(frame, args.low, args.high)
        clean_frame = decontaminate_background(frame, alpha, bg)
        rgba = cv2.cvtColor(clean_frame, cv2.COLOR_BGR2BGRA)
        rgba[:, :, 3] = alpha

        out = args.frames_dir / f"frame_{written + 1:04d}.png"
        cv2.imwrite(str(out), rgba)
        written += 1
        index += 1

    cap.release()
    print(f"written_frames={written}")


if __name__ == "__main__":
    main()
