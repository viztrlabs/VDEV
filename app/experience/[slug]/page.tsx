import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getExperience(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/experiences/public/${slug}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.success ? json : null;
}

export default async function ExperiencePage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getExperience(slug);

  if (!data) notFound();

  const { experience, config } = data;

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1>{experience.title}</h1>
      {experience.description && (
        <p style={{ color: '#666', lineHeight: 1.6 }}>{experience.description}</p>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #eee', borderRadius: 8 }}>
        <p><strong>Status:</strong> {experience.status}</p>
        {experience.published_at && (
          <p><strong>Published:</strong> {new Date(experience.published_at).toLocaleDateString()}</p>
        )}
        {experience.metadata?.shareUrl && (
          <p>
            <strong>Share URL:</strong>{' '}
            <a href={experience.metadata.shareUrl} target="_blank" rel="noopener noreferrer">
              {experience.metadata.shareUrl}
            </a>
          </p>
        )}
        {experience.metadata?.qrCodeUrl && (
          <div style={{ marginTop: '1rem' }}>
            <img
              src={experience.metadata.qrCodeUrl}
              alt="QR Code"
              width={150}
              height={150}
            />
          </div>
        )}
      </div>

      {config && (
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #eee', borderRadius: 8 }}>
          <h2>Experience Config</h2>
          <pre style={{ fontSize: 12, overflow: 'auto' }}>
            {JSON.stringify(config.config, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
