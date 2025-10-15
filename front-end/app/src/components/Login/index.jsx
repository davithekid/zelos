import LoginForm from "./LoginForm";
import ParticlesFundo from "./Particulas";

export default function Login() {
  return (
    <section className="w-full h-screen flex flex-row">

      <div className="w-full lg:w-[60%] h-full relative">
        <div className="absolute inset-0 bg-[url('/red3.png')] bg-cover bg-center z-0" />
        <div className="hidden lg:block absolute inset-0 z-10">
          <ParticlesFundo />
        </div>
        <div className="lg:hidden w-full h-full flex items-center justify-center p-4 relative z-20">
          <LoginForm />
        </div>
      </div>
      <div className="hidden lg:flex w-[40%] h-full bg-white items-center justify-center">
        <LoginForm />
      </div>

    </section>
  );
}