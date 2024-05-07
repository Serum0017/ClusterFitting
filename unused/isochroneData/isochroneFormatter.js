// plan: load data using fs, parse data to columns (each file text content.split('\n').slice(90)), then using existing alg to extract, then write to another file?

const fs = require('fs');
let path = __filename.split('\\')
path.pop();
path = path.join('\\');
path += '\\finalIsochroneData';

const filesNames = [];
fs.readdir(path, function(err, items) {
    for (var i=0; i<items.length; i++) {
        // if(items[i].includes('(1)')) continue;
        filesNames.push(items[i]);
    }

    readFileContent();
});

const stream = require("stream");
function readFileContent(){
    let amountToEnd = filesNames.length;
    for(let i = 0; i < filesNames.length; i++){
        let fileStream = fs.createReadStream(path + `\\${filesNames[i]}`);

        let metallicity = filesNames[i].replace('(1)','').split('m')[1];
        metallicity = metallicity.substring(0, metallicity.length - 4);
        metallicity = Math.round(parseFloat(metallicity) * 100000) / 100000;
    
        let fileData = "";
    
        fileStream.on("data", chunk => {
            fileData += chunk;
        });
    
        fileStream.on("end", () => {
            addData(fileData.split('\n').slice(89), metallicity);
            amountToEnd--;
            console.log('finished! Amount to go: ' + amountToEnd);
            if(amountToEnd <= 0){
                console.log('done!');

                let writePath = __filename.split('\\');
                writePath.pop();
                writePath = writePath.join('\\');
                writePath += '\\isochroneData.js';
                console.log('writing to ' + writePath);

                fs.writeFile(writePath, 'const isochroneData = Object.freeze(' + JSON.stringify(isochroneData) + ');', err => {
                    if (err) {
                      console.error(err);
                    } else {
                      console.log('file written successfully!');
                    }
                });
            }
        });
    }
}

// format: {logAge: {metallicity: [[point1logTemp, point1logLum], ...]}}
const isochroneData = {};

function addData(columns, metallicity) {
    for(let i = 0; i < columns.length; i++){
        const c = columns[i].split(' ');
        const logAge = Math.round(parseFloat(c[1]) * 100000) / 100000;
        if(isNaN(logAge)) continue;
        const logLuminosity = parseFloat(c[8]);
        const logTemperature = parseFloat(c[13]);
    
        if(isochroneData[logAge] === undefined) isochroneData[logAge] = {};
        if(isochroneData[logAge][metallicity] === undefined) isochroneData[logAge][metallicity] = [];
        isochroneData[logAge][metallicity].push([logTemperature, logLuminosity]);
    }
}


// const data = [sixSevenData, sevenEightData, eightNineData, nineTenData].join('\n');

// const columns = data.split('\n');

// // EEP log10_isochrone_age_yr initial_mass star_mass star_mdot he_core_mass c_core_mass o_core_mass log_L log_L_div_Ledd log_LH log_LHe log_LZ log_Teff log_abs_Lgrav log_R log_g log_surf_z surf_avg_omega surf_avg_v_rot surf_num_c12_div_num_o16 v_wind_Km_per_s surf_avg_omega_crit surf_avg_omega_div_omega_crit surf_avg_v_crit surf_avg_v_div_v_crit surf_avg_Lrad_div_Ledd v_div_csound_surf surface_h1 surface_he3 surface_he4 surface_li7 surface_be9 surface_b11 surface_c12 surface_c13 surface_n14 surface_o16 surface_f19 surface_ne20 surface_na23 surface_mg24 surface_si28 surface_s32 surface_ca40 surface_ti48 surface_fe56 log_center_T log_center_Rho center_degeneracy center_omega center_gamma mass_conv_core center_h1 center_he4 center_c12 center_n14 center_o16 center_ne20 center_mg24 center_si28 pp cno tri_alfa burn_c burn_n burn_o c12_c12 delta_nu delta_Pg nu_max acoustic_cutoff max_conv_vel_div_csound max_gradT_div_grada gradT_excess_alpha min_Pgas_div_P max_L_rad_div_Ledd e_thermal phase