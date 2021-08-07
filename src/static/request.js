export default Object.freeze(function sendRequest(url, body) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    const options = {
        method: 'post',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken
        },
        redirect: 'manual'
    };

    options.body = JSON.stringify(body);

    return fetch(url, options);
});