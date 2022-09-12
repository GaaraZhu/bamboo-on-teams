import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const axiosGet = async (
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> => {
  return await axiosProcess(
    (url, _, config) => axios.get(url, config),
    url,
    undefined,
    config
  );
};

export const axiosPost = async (
  url: string,
  payload: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> => {
  return await axiosProcess(axios.post, url, payload, config);
};

export const axiosPut = async (
  url: string,
  payload: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> => {
  return await axiosProcess(axios.put, url, payload, config);
};

const axiosProcess = async (
  process: (
    url: string,
    payload?: any,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse>,
  url: string,
  payload?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> => {
  let response;
  try {
    response = await process(url, payload, config);
  } catch (err: any) {
    // axios error handling
    let message = err.response?.data?.message;
    if (!message) {
      if (err.response?.data?.errors) {
        message = JSON.stringify(err.response?.data?.errors);
      } else {
        message = err.message;
      }
    }
    console.log(`Failed to call ${url} due to ${JSON.stringify(err)}`);
    throw {
      status: err.response?.status,
      message,
    };
  }

  // response failure handling
  if (response.status >= 300) {
    console.log(
      `Unhappy response ${response.status} received when calling ${url} due to ${response.statusText}`
    );
    throw {
      status: response.status,
      message: response.statusText,
    };
  }
  return response;
};
