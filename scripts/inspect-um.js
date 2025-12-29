const fs = require('fs');
const data = require('../src/data/ptn-data.json');

const um = data.find(u => u.url.includes('passing-grade-um'));
if (um) {
    console.log('Found UM:', um.university);
    const akun = um.programs.filter(p => p.prodi.toUpperCase().includes('AKUNTANSI'));
    console.log('Akuntansi programs:', akun);
} else {
    console.log('UM not found in data');
}
