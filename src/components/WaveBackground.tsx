const WaveBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        className="absolute w-full h-full animate-wave"
        viewBox="0 0 400 800"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-50 100 Q 100 50, 150 150 T 250 200 T 350 150 T 450 200 L 450 800 L -50 800 Z"
          className="fill-primary/10"
        />
        <path
          d="M-50 200 Q 50 150, 150 250 T 300 200 T 400 250 T 500 200 L 500 800 L -50 800 Z"
          className="fill-accent/5"
        />
        <path
          d="M-50 300 Q 100 250, 200 350 T 350 300 T 450 350 L 450 800 L -50 800 Z"
          className="fill-primary/5"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

export default WaveBackground;
