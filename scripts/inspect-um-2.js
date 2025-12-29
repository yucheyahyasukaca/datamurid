const fs = require('fs');
const data = require('../src/data/ptn-data.json');

const um = data.find(u => u.url.endsWith('/passing-grade-um/') || u.url.endsWith('/passing-grade-um'));
if (um) {
    console.log('Found UM:', um.university);
    const akun = um.programs.filter(p => p.prodi.toUpperCase().includes('AKUN'));
    console.log('UM Programs:', akun);
} else {
    console.log('UM not found in data');
}

const ipb = data.find(u => u.url.includes('passing-grade-ipb'));
if (ipb) {
    console.log('\nFound IPB:', ipb.university);
    const akun = ipb.programs.filter(p => p.prodi.toUpperCase().includes('AKUN'));
    console.log('IPB Programs:', akun);
}
