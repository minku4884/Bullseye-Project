import axios from 'axios';

export const api_method = {
    get: 0,
    post: 1,
    put: 2
}

class ApiClient {
    //baseUrl = "https://192.168.0.103:5001";
    baseUrl = "http://api.hillntoe.com:7810";
    headers = {
        'Accept': '*/*',

        //'Content-Type' : '*/*',
        //'Content-Type' : 'multipart/form-data',
        //'Content-Type' : 'text/plain',
        //"Content-Type" : 'application/json',
        //'Content-Type' : 'application/x-www-form-urlencoded',

        //'User-Agent' : 'Mozilla/3.0 (compatible; Indy Library)'
    };

    // constructor(headers) {
    //     //headers['Accept'] = '*/*';

    //     //delete headers['Accept'];

    //     //this.headers.concat(headers);
    // }

    async RequestAsync(method, subUrl, parameters = null, body = null, token = null) {
        /// (Base examples..)
        // const response = fetch("https://localhost:5001/users")
        //                 .then((res) => res.json())
        //                 .then((data) => console.log(data));

        // headers = {
        //     'Accept': '*/*',
        //     'Authorization': 'test-token'
        // };

        // const response = await axios.get("https://localhost:5001/users", { headers: headers, withCredentials: true });

        /// (This class examples..)
        // var response;
        // response = await (new ApiClient()).Request(api_method.get, '/api/temp/get');
        // response = await (new ApiClient()).Request(api_method.get, `/api/temp/get/data?parameter=${user_id}`);
        // response = await (new ApiClient()).Request(api_method.post, '/api/temp/post');
        // response = await (new ApiClient()).Request(api_method.post, '/web/temp/post/data', null, data);

        try
        {
            const url = `${this.baseUrl}${subUrl}`;

            if (token !== null)
            {
                this.headers['Authorization'] = token;
                // this.headers['Access-Control-Allow-Origin'] = `http://localhost:3000`;
                // this.headers['Access-Control-Allow-Credentials'] = "true";
            }

            var result;
            if (method == api_method.get) 
            {
                //url을 통한 parameter 값이 null이면 400 에러 발생...
                //`https://localhost:5001/api/temp/get/data?parameter=${user_id}`

                // if (token === null)
                //     result = await axios.get(url, { parameters: parameters, headers: this.headers })
                // else
                //     result = await axios.get(url, { headers: this.headers, withCredentials: true })

                result = await axios.get(url, { parameters: parameters, headers: this.headers, withCredentials: true })
            }
            else if (method == api_method.post) 
            {
                if (body === null)
                {
                    result = await axios.post(url, '{ }', { parameters: parameters, headers: this.headers })
                }
                else
                {
                    //JSON.stringify(data)
                    result = await axios.postForm(url, body, { parameters: parameters, headers: this.headers })
                }
            }

            return result;
        }
        catch (error)
        {
            return null;
        }
    }
}

export default ApiClient;