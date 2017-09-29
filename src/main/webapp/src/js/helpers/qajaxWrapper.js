import qajax from "qajax";

let uniqueCalls = {};

function removeCall(uri) {
  delete uniqueCalls[uri];
}

const qajaxWrapper = function (opts = {}) {
  let defaults = {
    headers: {
      // "Accept": "application/json",
      // "Content-Type": "application/json"
    }
  };
  let options = {...defaults, ...opts};

  let uri = `${options.url}${JSON.stringify(options.params)}`;

  if (options.formData) {
    options.headers["Content-Type"] = "application/x-www-form-urlencoded";
    options.data = qajax.serialize(options.data);
  }

  let parseResponse = function (xhr) {
    let response = {};
    response.status = xhr.status;
    try {
      response.body = JSON.parse(xhr.responseText);
    } catch (e) {
      response.body = xhr.responseText;
    }
    return response;
  };

  if (!options.concurrent && uniqueCalls[uri]) {
    return uniqueCalls[uri];
  }

  let promise = new Promise((resolve, reject) => {
    qajax(options).then(
      function (xhr) {
        let response = parseResponse(xhr);
        removeCall(uri);
        if (response.status >= 200 && response.status < 300) {
          resolve(response);
        } else {
          if (response.status === 401 || response.status === 403) {
          }
          reject(response);
        }
      },
      function (xhr) {
        let response = parseResponse(xhr);
        removeCall(uri);
        reject(response);
      });
  });

  if (!options.concurrent) {
    uniqueCalls[uri] = promise;
  }

  return promise;
};

export default qajaxWrapper;
