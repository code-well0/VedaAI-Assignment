import Image from 'next/image';

/** Gradient logo mark only (app icon) */
export default function VedaAILogo({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/vedaai-logo-mark.png"
      alt="VedaAI"
      width={size}
      height={size}
      className="rounded-[10px] object-contain"
      style={{ width: size, height: size }}
    />
  );
}
