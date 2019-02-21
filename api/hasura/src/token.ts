import jwt from 'jsonwebtoken';
import config from './config';

function getAccessToken() {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        [config.hasuraTokenNameSpace]: {
          'x-hasura-allowed-roles': ['user'],
          'x-hasura-default-role': 'user',
        },
      },
      config.hasuraTokenSecretKey,
      {
        algorithm: config.hasuraTokenSecretAlgorithm,
        expiresIn: config.hasuraTokenLifeTime,
      },
      (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      },
    );
  });
}

// TODO: Implement:
// async function refresh() {}
export default {
  getAccessToken,
};
