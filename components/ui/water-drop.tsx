type WaterDropProps = {
  className?: string;
  size?: number;
};

export function WaterDrop({ className, size = 24 }: WaterDropProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M12 2.5C12 2.5 5 11.2 5 15.5C5 18.8 7.7 21.5 11 21.5H13C16.3 21.5 19 18.8 19 15.5C19 11.2 12 2.5 12 2.5Z"
        fill="currentColor"
      />
      <path
        d="M10.2 14.8C9.6 14.1 9.6 13 10.3 12.4C10.9 11.8 12 11.8 12.6 12.5L13.8 13.9C14.2 14.4 14.9 14.4 15.3 13.9C15.7 13.4 15.7 12.7 15.2 12.3L14.1 11.1"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.55"
      />
    </svg>
  );
}
