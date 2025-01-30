'use client';
import { useRouter } from 'next/navigation';
import { useTransition } from '@/app/contexts/TransitionContext';

const ProjectPage = ({ params }: { params: { slug: string } }) => {
  const router = useRouter();
  const { handleBack } = useTransition();

  const handleReturn = () => {
    handleBack();
    setTimeout(() => {
      router.push('/');
    }, 100);
  };

  return (
    <>
      <button
        style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          zIndex: 100,
          fontSize: '3.5rem',
        }}
        onClick={handleReturn}
        className='back-button'
      >
        Back
      </button>
    </>
  );
};

export default ProjectPage;
