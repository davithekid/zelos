import express from 'express';
import passport from '../configs/ldap.js';
import AuthController from '../controllers/AuthController.js';
import Usuario from '../entities/Usuario.js';

const router = express.Router();

router.post('/login', (req, res, next) => {

  const { username, password } = req.body;
  // user fixo
  const DEV_USER = 'devuser';
  const DEV_PASSWORD = '123';

  if (username === DEV_USER && password === DEV_PASSWORD) {
    console.log('>>> ATIVANDO MODO DE LOGIN DE DESENVOLVEDOR <<<');

    const mockUsuario = {
      id: '00000000-0000-0000-0000-000000000001', 
      username: DEV_USER,
      nome: 'Usuário Desenvolvedor',
      email: 'dev@local.com',
      funcao: 'admin', 
    };    

    const token = AuthController.gerarToken(mockUsuario);

    return res.json({
      message: 'Autenticado com sucesso (MODO DEV)',
      user: {
        ...mockUsuario,
        token
      }
    });
  }


  passport.authenticate('ldapauth', { session: true }, async (err, user, info) => {
    try {
      if (err) {
        console.error('Erro na autenticação:', err);
        return res.status(500).json({ error: 'Erro interno no servidor' });
      }

      if (!user) {
        console.warn('Falha na autenticação:', info?.message || 'Credenciais inválidas');
        return res.status(401).json({ error: info?.message || 'Autenticação falhou' });
      }

      console.log('LDAP retornou:', user);

      // aqui estou fazendo com que 3 users tenha o padrao de acesso do sistema
      let funcao = 'usuario';

      if (user.sAMAccountName === '24250492') funcao = 'usuario';
      if (user.sAMAccountName === '24250469') funcao = 'admin';
      if (user.sAMAccountName === '24250246') funcao = 'tecnico';
      // xqMeBX
      if (user.sAMAccountName === '00000000') funcao = 'tecnico';

      // aqui estou bucando e se não estiver cadastrado no meu banco eu crio
      let usuario = await Usuario.findOne({
        where: { username: user.sAMAccountName },
        attributes: { exclude: ['senha', 'password'] }
      });

      if (!usuario) {
        usuario = await Usuario.create({
          username: user.sAMAccountName,
          nome: user.displayName,
          email: user.userPrincipalName,
          funcao: funcao
        });
      } else {
        if (usuario.funcao !== funcao) {
          usuario.funcao = funcao;
          await usuario.save();
        }
      }

      // Loga o usuário manualmente para garantir a sessão
      req.logIn(usuario, (loginErr) => {
        if (loginErr) {
          console.error('Erro ao criar sessão:', loginErr);
          return res.status(500).json({ error: 'Erro ao criar sessão' });
        }

        const token = AuthController.gerarToken({
          id: usuario.id,
          username: usuario.username,
          nome: usuario.nome,
          email: usuario.email,
          funcao: usuario.funcao
        });

        console.log('Usuário autenticado:', user.displayName);
        return res.json({
          message: 'Autenticado com sucesso',
          user: {
            id: usuario.id,
            username: usuario.username,
            nome: usuario.nome,
            email: usuario.email,
            funcao: usuario.funcao,
            token
          }
        });
      });

    } catch (error) {
      console.error('Erro inesperado:', error);
      res.status(500).json({ error: 'Erro inesperado no servidor' });
    }
  })(req, res, next);
});

router.post('/logout', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Nenhum usuário autenticado' });
  }

  console.log('Usuário deslogando:', req.user?.username);

  req.logout((err) => {
    if (err) {
      console.error('Erro no logout:', err);
      return res.status(500).json({ error: 'Erro ao realizar logout' });
    }

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('Erro ao destruir sessão:', destroyErr);
        return res.status(500).json({ error: 'Erro ao encerrar sessão' });
      }

      res.clearCookie('connect.sid');
      res.json({ message: 'Logout realizado com sucesso' });
    });
  });
});

router.get('/check-auth', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      authenticated: true,
      user: {
        username: req.user.username,
        displayName: req.user.displayName
      }
    });
  }
  res.status(401).json({ authenticated: false });
});

export default router;