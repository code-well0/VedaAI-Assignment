import Image from 'next/image';
import Link from 'next/link';

/**
 * Official VedaAI wordmark (gradient mark + bold logotype) from design assets.
 */
export default function VedaAIWordmark({ href = '/' }: { href?: string }) {
  const content = (
    <Image
      src="/vedaai-logo.png"
      alt="VedaAI"
      width={132}
      height={36}
      priority
      className="h-9 w-auto object-contain object-left"
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center shrink-0">
        {content}
      </Link>
    );
  }

  return <div className="inline-flex items-center shrink-0">{content}</div>;
}
