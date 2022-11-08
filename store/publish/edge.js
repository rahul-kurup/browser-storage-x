// https://github.com/PlasmoHQ/edge-addons-api/blob/main/src/index.ts

require('dotenv').config();
const fs = require('fs');
const axios = require('axios').default;

const refresh_token = process.env.EDGE_REFRESH_TOKEN;
const client_id = process.env.EDGE_CLIENT_ID;
const client_secret = process.env.EDGE_CLIENT_SECRET;
const app_id = process.env.EDGE_APP_ID || 'pafddkhaocklakonboekmgodcmgmfcbp';

export const errorMap = {
  productId:
    'Product ID is required. To get one, go to: https://partner.microsoft.com/en-us/dashboard/microsoftedge/{product-id}/package/dashboard',
  clientId:
    'Client ID is required. To get one: https://partner.microsoft.com/en-us/dashboard/microsoftedge/publishapi',
  clientSecret:
    'Client Secret is required. To get one: https://partner.microsoft.com/en-us/dashboard/microsoftedge/publishapi',
  accessTokenUrl:
    'Access token URL is required. To get one: https://partner.microsoft.com/en-us/dashboard/microsoftedge/publishapi',
};

export const requiredFields = Object.keys(errorMap);

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const baseApiUrl = 'https://api.addons.microsoftedge.microsoft.com';

export class Extension {
  constructor(options) {
    this.options = {};

    // https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/api/addons-api-reference#status-codes
    this.handleTempStatus = (statusCode, action) => {
      if (statusCode !== 202) {
        if (statusCode >= 500) {
          throw new Error('Edge server error, please try again later');
        } else {
          throw new Error(
            `${action} failed, double check your api credentials`
          );
        }
      }
    };

    this.getAccessToken = async () => {
      const { data } = await axios.post(`${this.options.accessTokenUrl}`, {
        data: `client_id=${this.options.clientId}&scope=${baseApiUrl}/.default&client_secret=${this.options.clientSecret}&grant_type=client_credentials`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return data.access_token;
    };

    for (const field of requiredFields) {
      if (!options[field]) {
        throw new Error(errorMap[field]);
      }
      this.options[field] = options[field];
    }
  }

  get productEndpoint() {
    return `${baseApiUrl}/v1/products/${this.options.productId}`;
  }

  get publishEndpoint() {
    return `${this.productEndpoint}/submissions`;
  }

  get uploadEndpoint() {
    return `${this.publishEndpoint}/draft/package`;
  }

  /**
   * @returns the publish operation id
   */
  async submit({ filePath = '', notes = '' }) {
    const accessToken = await this.getAccessToken();
    const uploadResp = await this.upload(
      createReadStream(filePath),
      accessToken
    );
    await this.waitForUpload(uploadResp, accessToken);
    return this.publish(notes, accessToken);
  }

  async publish(notes = '', _accessToken = null) {
    const accessToken = _accessToken || (await this.getAccessToken());
    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    if (notes.length > 0) {
      options.data = { notes };
    }
    const { data, headers } = await axios.post(this.publishEndpoint, options);
    this.handleTempStatus(data.statusCode, 'Submit');
    return headers.location;
  }

  async upload(readStream = null, _accessToken = null) {
    const accessToken = _accessToken || (await this.getAccessToken());
    const uploadResp = await axios.post(this.uploadEndpoint, {
      data: readStream,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/zip',
      },
    });
    this.handleTempStatus(uploadResp.statusCode, 'Upload');
    return uploadResp.headers.location;
  }

  async getPublishStatus(operationId, _accessToken = null) {
    const accessToken = _accessToken || (await this.getAccessToken());
    const statusEndpoint = `${this.publishEndpoint}/operations/${operationId}`;
    return axios.get(statusEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async waitForUpload(
    operationId,
    _accessToken = null,
    retryCount = 5,
    pollTime = 3000
  ) {
    const accessToken = _accessToken || (await this.getAccessToken());
    const statusEndpoint = `${this.uploadEndpoint}/operations/${operationId}`;
    let successMessage;
    let uploadStatus;
    let attempts = 0;
    while (uploadStatus !== 'Succeeded' && attempts < retryCount) {
      const statusResp = await axios.get(statusEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (statusResp.status === 'Failed') {
        throw new Error(
          statusResp.message ||
            statusResp.errorCode + ':' + (statusResp.errors || []).join(',')
        );
      } else if (statusResp.status === 'InProgress') {
        await wait(pollTime);
      } else if (statusResp.status === 'Succeeded') {
        successMessage = statusResp.message;
      }
      uploadStatus = statusResp.status;
      attempts++;
    }
    return successMessage;
  }
}
