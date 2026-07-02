import { useRive } from "@rive-app/react-canvas";

interface RivePlayerProps {
  src: string;
  className?: string;
  animations?: string | string[];
  stateMachines?: string | string[];
  stateMachineBooleans?: Record<string, boolean>;
}

export default function RivePlayer({
  src,
  className,
  animations,
  stateMachines,
  stateMachineBooleans,
}: RivePlayerProps) {
  const { RiveComponent } = useRive({
    src,
    animations,
    stateMachines,
    autoplay: true,
    onRiveReady: (rive) => {
      if (!stateMachines || !stateMachineBooleans) return;

      const machineNames = Array.isArray(stateMachines)
        ? stateMachines
        : [stateMachines];

      machineNames.forEach((machineName) => {
        rive.stateMachineInputs(machineName).forEach((input) => {
          const nextValue = stateMachineBooleans[input.name];
          if (typeof nextValue === "boolean" && "value" in input) {
            input.value = nextValue;
          }
        });
      });
    },
  });

  return (
    <div className={className}>
      <RiveComponent className="h-full w-full" />
    </div>
  );
}
