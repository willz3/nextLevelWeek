import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

export default {
    storage: multer.diskStorage({
        //Diretórios para onde vão os arquivos que o usuário deu upload.
        destination: path.resolve(__dirname, '..', '..', 'upload'),
        filename(request, file, callback){
            const hash = crypto.randomBytes(6).toString('hex');

            const fileName = `${hash}-${file.originalname}`;

            callback(null, fileName);
        },
    }),
}