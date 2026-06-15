// src/lib/pinata.js
import axios from "axios";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export const pinataClient = axios.create({
  baseURL: "https://api.pinata.cloud/",
  headers: {
    Authorization: `Bearer ${PINATA_JWT}`,
  },
});

export default pinataClient;