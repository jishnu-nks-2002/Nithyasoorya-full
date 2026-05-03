import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchAdminConfig } from '../api/galleryHero';
import { Card, CardHeader, StatCard, Badge, Button, PageHeader, EmptyState, Spinner } from '../components/ui';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchAdminConfig();
        setData(res.data.data);
      } catch (e) {
        toast.error('Failed to load config');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size={28} />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  const slides = data?.slides || [];
  const activeSlides = slides.filter((s) => s.isActive);
  const images = slides.filter((s) => s.type === 'image');
  const videos = slides.filter((s) => s.type === 'video');

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your Gallery Hero configuration"
      >
        <Button onClick={() => navigate('/slides')}>Manage slides</Button>
        <Button variant="primary" onClick={() => navigate('/settings')}>Settings</Button>
      </PageHeader>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatCard label="Total slides" value={slides.length} />
        <StatCard label="Active" value={activeSlides.length} color="var(--success)" />
        <StatCard label="Images" value={images.length} color="var(--info)" />
        <StatCard label="Videos" value={videos.length} color="var(--warning)" />
      </div>

      {/* Config overview */}
      <Card className={styles.card}>
        <CardHeader title="Hero configuration">
          <Button size="sm" onClick={() => navigate('/settings')}>Edit</Button>
        </CardHeader>
        <div className={styles.configTable}>
          {[
            ['Vertical text', data?.verticalText],
            ['Left label', data?.leftLabel],
            ['CTA text', data?.ctaText],
            ['CTA link', data?.ctaLink],
            ['Autoplay interval', data?.autoPlayInterval ? `${data.autoPlayInterval}ms` : '—'],
            ['Status', null],
          ].map(([key, val]) => (
            <div key={key} className={styles.configRow}>
              <span className={styles.configKey}>{key}</span>
              {key === 'Status' ? (
                <Badge variant={data?.isActive ? 'success' : 'warning'}>
                  {data?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              ) : (
                <span className={styles.configVal}>{val || '—'}</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Slides list */}
      <Card>
        <CardHeader title="Slides overview">
          <Button size="sm" onClick={() => navigate('/slides')}>Manage</Button>
        </CardHeader>

        {slides.length === 0 ? (
          <EmptyState
            icon="🖼"
            title="No slides yet"
            subtitle="Head to Manage Slides to add your first slide."
            action={<Button variant="primary" onClick={() => navigate('/slides')}>Add first slide</Button>}
          />
        ) : (
          <div>
            {[...slides].sort((a, b) => a.order - b.order).map((slide) => (
              <div key={slide._id} className={styles.slideRow}>
                <span className={styles.orderBadge}>{slide.order + 1}</span>
                <div className={styles.slideThumb}>
                  {slide.src ? (
                    <img src={slide.src} alt={slide.alt} />
                  ) : (
                    <span>{slide.type === 'video' ? '🎬' : '🖼'}</span>
                  )}
                </div>
                <div className={styles.slideInfo}>
                  <div className={styles.slideName}>{slide.title || 'Untitled'}</div>
                  <div className={styles.slideMeta}>
                    <Badge variant="default">{slide.type}</Badge>
                  </div>
                </div>
                <Badge variant={slide.isActive ? 'success' : 'warning'}>
                  {slide.isActive ? 'Active' : 'Hidden'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
