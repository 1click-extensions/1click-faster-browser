function setDomain(domain, level) {
    domains  = getDomains();
    domains[domain] = level;
    localStorage.setItem('domains', JSON.stringify(domains));
};
function getDomains() {
    var domains;
    try {
        domains = JSON.parse(localStorage.getItem('domains'));
    } catch (error) {
        domains = {};
    }
    return domains ? domains : {};
    //     domains = data;
    //     console.log(domains, 'domains');
}

function getGlobalThrottleLevel(){
    return localStorage.getItem('globalThrottleLevel');
}

function setGlobalThrottleLevel(value){
    return localStorage.setItem('globalThrottleLevel', value);
}