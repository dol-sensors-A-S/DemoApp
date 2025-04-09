export function getConfig() {
  let domain = process.env.REACT_APP_AUTH0_DOMAIN || window.config.REACT_APP_AUTH0_DOMAIN;
  domain = domain.slice(0, -1)

  return {
    domain: domain,
    clientId: process.env.REACT_APP_AUTH0_CLIENTID || window.config.REACT_APP_AUTH0_CLIENTID,
    audience: process.env.REACT_APP_AUTH0_AUDIENCE || window.config.REACT_APP_AUTH0_AUDIENCE,
  };
}
