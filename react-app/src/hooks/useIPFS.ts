import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: "example-gateway.mypinata.cloud",
});

export function useIPFS() {
  const upload = async (base64: string) => {
    const result = await pinata.upload.public.base64(base64);
    return {
      ...result,
      url: `ipfs://${result.cid}`,
    };
  };

  return { upload };
}
