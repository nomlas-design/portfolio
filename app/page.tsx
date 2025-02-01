import Scene from '@/app/components/Scene';
import LogoSymbol from './svg/LogoSymbol';
import Footer from '@/app/components/Footer';

export default function Home() {
  return (
    <div>
      <div className='logo'>
        <LogoSymbol colour='#ebece9' />
      </div>
      <Footer />
    </div>
  );
}
