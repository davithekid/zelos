import jwt from 'jsonwebtoken';
const jwtSecret = process.env.JWT_SECRET;

class AuthController {

    gerarToken(payload) {
        if (!jwtSecret) {
            throw new Error('JWT_SECRET não definido no ambiente');
        }

          return jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
    }

    // este método não será mais usado 
    async login(req, res) {
        return res.status(400).json({
            message: 'Método não suportado. Use a autenticação LDAP diretamente.'
        });
    }

    // gerar token
    gerarTokenParaUsuarioLDAP(usuario) {
        return this.gerarToken({
            id: usuario.id,
            username: usuario.username,
            nome: usuario.nome,
            email: usuario.email,
            funcao: usuario.funcao
        });
    }
}

export default new AuthController();