'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link'; 
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export default function NotFound() {
    const [redirectPath, setRedirectPath] = useState('/');
    const [redirectLabel, setRedirectLabel] = useState('Ir para o Login');
    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);

                if (decoded && decoded.funcao) {
                    switch (decoded.funcao) {
                        case 'admin':
                            setRedirectPath('/admin');
                            setRedirectLabel('Voltar ao seu Painel');
                        case 'tecnico':
                            setRedirectPath('/tecnico');
                            setRedirectLabel('Voltar ao seu Painel');
                            break;
                        case 'usuario':
                            setRedirectPath('/usuario');
                            setRedirectLabel('Voltar à Página Inicial');
                            break;
                        default:
                            setRedirectPath('/');
                            setRedirectLabel('Ir para o Login');
                    }
                }
            } catch (error) {
                console.error("Token inválido na página 404, redirecionando para login:", error.message);
                setRedirectPath('/');
                setRedirectLabel('Ir para o Login');
            }
        }
    }, []); 


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="font-extrabold text-7xl text-center text-gray-800">Ops!</h1>
                <h2 className="font-bold text-6xl text-center mt-9 text-red-600">404</h2>
                <p className="text-center text-lg mt-10 text-gray-600">Desculpe, essa página não foi encontrada.</p>
                <p className="text-center text-lg mt-2 text-gray-500 max-w-md mx-auto">
                    O endereço pode estar incorreto ou a página pode ter sido removida.
                </p>
                <div className="flex justify-center mt-10">
                    <Link href={redirectPath} passHref>
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg cursor-pointer shadow-md hover:shadow-lg transition-all"
                        >
                            {redirectLabel}
                        </motion.button>
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}