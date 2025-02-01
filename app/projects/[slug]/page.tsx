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
      {/* <div className='wrapper'>
        <main className='container container--project'>
          <h1>Project Page</h1>
        </main>
      </div> */}
    </>
  );
};

export default ProjectPage;
