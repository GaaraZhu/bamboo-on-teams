import axios from "axios";
import {
  axiosGet,
  axiosPost,
  axiosPut,
} from "../../src/functions/services/axiosService";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("http operations", () => {
  it("GET correctly", async () => {
    const url = "https://test.co.nz/browse/API1-4";
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    };
    const resp = {
      key: "123",
      service: "customers-v1",
    };
    mockedAxios.get.mockReturnValueOnce(
      Promise.resolve({
        data: resp,
        status: 200,
      })
    );
    const { data, status } = await axiosGet(url, config);
    expect(mockedAxios.get).toHaveBeenCalledWith(url, config);
    expect(data).toEqual(resp);
    expect(status).toEqual(200);
  });

  it("POST correctly", async () => {
    const url = "https://test.co.nz/browse/API1-4";
    const payload = {
      data: "123",
    };
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    };
    const resp = {
      key: "123",
      service: "customers-v1",
    };
    mockedAxios.post.mockReturnValueOnce(
      Promise.resolve({
        data: resp,
        status: 200,
      })
    );
    const { data, status } = await axiosPost(url, payload, config);
    expect(mockedAxios.post).toHaveBeenCalledWith(url, payload, config);
    expect(data).toEqual(resp);
    expect(status).toEqual(200);
  });

  it("PUT correctly", async () => {
    const url = "https://test.co.nz/browse/API1-4";
    const payload = {
      data: "123",
    };
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    };
    const resp = {
      key: "123",
      service: "customers-v1",
    };
    mockedAxios.put.mockReturnValueOnce(
      Promise.resolve({
        data: resp,
        status: 200,
      })
    );
    const { data, status } = await axiosPut(url, payload, config);
    expect(mockedAxios.put).toHaveBeenCalledWith(url, payload, config);
    expect(data).toEqual(resp);
    expect(status).toEqual(200);
  });
});
