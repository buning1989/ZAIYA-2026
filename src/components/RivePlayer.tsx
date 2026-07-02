import { useRive } from "@rive-app/react-canvas";

interface RivePlayerProps {
  src: string;
  className?: string;
}

export default function RivePlayer({ src, className }: RivePlayerProps) {
  const { RiveComponent } = useRive({
    src,
    stateMachines: "State Machine 1",
    autoplay: true,
  });

  return (
    <div className={className}>
      <RiveComponent className="h-full w-full" />
    </div>
  );
}
