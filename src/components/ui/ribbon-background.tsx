import Image from 'next/image';

const RibbonBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <Image
        src="/images/hero-ribbon.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center select-none"
        draggable={false}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(40,18,68,0.35),transparent_55%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#060313]/70 via-[#0a051a]/55 to-[#020107]/80" />
    </div>
  );
};

export default RibbonBackground;
