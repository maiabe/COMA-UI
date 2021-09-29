
document.getElementById('runButton').addEventListener('click', () => {
    getRequest(url);
    GM.HUB.run();
});
