import JsonLdScript from '@/components/seo/JsonLdScript';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqStructuredDataProps = {
  faqs: FaqItem[];
  id?: string;
};

export default function FaqStructuredData({ faqs, id = 'faq-json-ld' }: FaqStructuredDataProps) {
  if (!faqs.length) return null;

  return (
    <JsonLdScript
      id={id}
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }}
    />
  );
}
