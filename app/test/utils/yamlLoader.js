import yaml from 'js-yaml';
import fs from 'fs'
import path from 'path'
import Interpreter from './../../components/dsl/interpreter/interpreter';

export default {

    load: function (yamlName) {
        var releaseObj = yaml.load(fs.readFileSync(path.join(__dirname, '../yaml-samples/' + yamlName), 'utf8'));
        var interpreter = new Interpreter();
        var release = interpreter.parse(releaseObj);
        
        return release;
    },

    loadJSON: function (yamlName) {
        var releaseObj = yaml.load(fs.readFileSync(path.join(__dirname, '../yaml-samples/' + yamlName), 'utf8'));
        return releaseObj;
    }

}