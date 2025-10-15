'use client'

import { useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner'; 

const Spinner = () => (
  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
);

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/auth/login', {
        username: email,
        password: password
      }, {
        withCredentials: true
      });

      const { user } = response.data;
      if (user && user.token) {
        toast.success("Login realizado com sucesso! Redirecionando...");
        Cookies.set('token', user.token, { expires: 1 });
        setTimeout(() => {
            switch (user.funcao) {
                case 'admin':
                    router.push('/admin');
                    break;
                case 'tecnico':
                    router.push('/tecnico');
                    break;
                case 'usuario':
                    router.push('/usuario');
                    break;
                default:
                    router.push('/');
            }
        }, 1000); 
        
      } else {
        toast.error("Token de autenticação não foi recebido. Tente novamente."); 
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                           (err.request ? "Não foi possível conectar ao servidor." : "Ocorreu um erro inesperado.");
      toast.error(errorMessage); 
      console.error("Erro no login:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl lg:bg-transparent lg:shadow-none lg:p-0 lg:max-w-none lg:w-[70%]">
      <div className="w-full flex flex-col items-start">
        <Image src="/senai.svg" width={72} height={72} alt="logo do SENAI" />

        <h1 className="mt-5 text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
          Faça login
        </h1>
        
        <form className="w-full mt-6" onSubmit={handleLogin}>
          <div className="w-full">
            <label className="text-base font-semibold text-gray-700">Username</label>
            <input
              name="email"
              placeholder="Insira seu username"
              className="mt-2 focus:outline-none w-full border-2 border-gray-200 rounded-md h-[45px] text-black px-4 transition-all focus:border-red-500 focus:ring-1 focus:ring-red-200 disabled:bg-gray-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="w-full mt-7">
            <label className="text-base font-semibold text-gray-700">Senha</label>
            <input
              type="password"
              name="password"
              placeholder="Sua senha de rede"
              className="mt-2 focus:outline-none w-full border-2 border-gray-200 rounded-md h-[45px] text-black px-4 transition-all focus:border-red-500 focus:ring-1 focus:ring-red-200 disabled:bg-gray-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="mt-10 w-full rounded-md bg-[#e7000b] h-[50px] flex items-center justify-center text-white font-extrabold text-lg cursor-pointer transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}