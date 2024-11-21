import { randomMotto } from '@/utils/motto';

export default function LogoMotto() {
  const motto = randomMotto();

  return (
    <div className="md:flex flex-col items-center justify-center text-center">
      <img src="/logo.svg" alt="Logo" className="h-64 mb-4" />
      <p className="text-2xl italic text-white">{motto}</p>
    </div>
  );
}
