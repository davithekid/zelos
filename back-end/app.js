import dotenv from 'dotenv';
import express from 'express';
import sequelize from './configs/database.js';
import passport from './configs/ldap.js';
import cors from 'cors';
import session from 'express-session';
import path from "path";
import { fileURLToPath } from "url";

// Apenas para simular __dirname no ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// routes
import usuarioRoutes from './routes/usuarioRoutes.js';
import poolRoutes from './routes/poolRoutes.js';
import chamadoRoutes from './routes/chamadoRoutes.js';
import apontamentoRoutes from './routes/apontamentoRoutes.js';
import relatorioRoutes from './routes/relatorioRoutes.js';
import authRoutes from './routes/authRoutes.js';
import equipamentoRoutes from './routes/equipamentoRoutes.js';
import notificacaoRoutes from './routes/notificacaoRoutes.js';
import pedidoChamadoRoutes from './routes/pedidoChamadoRoutes.js'
import pedidosFechamentosRoutes from './routes/pedidoFechamentosRoutes.js'

const app = express();
const PORT = process.env.PORT || 3001;


// .env
dotenv.config();
// middleware
app.use(express.json());

try {
    app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }));
    app.use(express.json());
    
    app.use(session({
      secret: 'sJYMmuCB2Z187XneUuaOVYTVUlxEOb2K94tFZy370HjOY7T7aiCKvwhNQpQBYL9e',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === 'production' }
    }));
  
    // 4. Inicialização segura do Passport
    if (!passport) {
      throw new Error('Passport não foi importado corretamente');
    }
    app.use(passport.initialize());
    app.use(passport.session());
  
  } catch (err) {
    console.error('Erro na configuração inicial:', err);
    process.exit(1);
  }

// rota inicial
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Página inicial' })
})

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/usuarios', usuarioRoutes);
app.use('/pools', poolRoutes);
app.use('/chamados', chamadoRoutes);
app.use('/apontamentos', apontamentoRoutes);
app.use('/relatorios', relatorioRoutes);
app.use('/auth', authRoutes);
app.use('/equipamentos', equipamentoRoutes);
app.use('/notificacao', notificacaoRoutes);
app.use('/pedidos-chamado', pedidoChamadoRoutes);
app.use('/pedidos-fechamento', pedidosFechamentosRoutes);

async function StartServer() {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o database feita com sucesso!!!');

        // server
        app.listen(PORT, () => {
            console.log('Servidor sendo executado em: localhost:3001');
        })

    } catch (err) {
        console.error('Erro ao conectar banco de dados: ', err)
    }
}

StartServer();
