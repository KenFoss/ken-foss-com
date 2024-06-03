const api_key = process.env.REACT_APP_API_TOKEN;
const encoded_api_key = btoa(api_key);

export { encoded_api_key };
