import axios from "axios";
import { axiosGet } from "../../src/functions/services/axiosService";

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
    mockedAxios.get.mockReturnValueOnce(
      Promise.resolve({
        data: {},
      })
    );
    await axiosGet(url, config);
    expect(mockedAxios.get).toHaveBeenCalledWith(url, config);
  });
});
