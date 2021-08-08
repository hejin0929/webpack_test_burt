const fs = require('fs')
const path = require('path')
const parse = require('swagger-parser')
const beautify = require('js-beautify').js_beautify;
const swaggerUrl = 'http://localhost:8080/swagger/doc.json';

// api接口方法存放目录
const API_PATH = path.resolve(__dirname, '../../api')

const repTypeMap = new Map();

// 判断目录是否存在
const isExist = (lastPath = '') => {
  // const privatePath = `${lastPath ? API_PATH + '/' + lastPath : API_PATH}`
  // const stat = fs.existsSync(privatePath)
  // if (!stat) {
  //   fs.mkdirSync(privatePath)
  // }
  if (!lastPath) {
    const configPath = `${API_PATH}/index.ts`
    // api 目录下写入 config文件
    fs.access(configPath, function (err) {
      if (err && err.code === 'ENOENT') {
        fs.writeFileSync(`${API_PATH}/index.ts`, 'export const ip = \'http://localhost:8080/swagger/doc.json/\'')
      }
    })
  }
}
// 模块名称整理
// const moduleName = (operationId) => {
//   return String(operationId).replace(/Using|_/g, '_');
// }


// 整理出相同模块路径
const getModules = (map) => {
  let moduleList = [];
  map.forEach((value) => {
    const module = writeFileApi(value);
    moduleList = [...moduleList, ...module];
  });
  return moduleList;
}


const TransFormUrlParams = (ParamsList, interfaceName) => {
    if (!ParamsList || ParamsList.length === 0) {
      return '';
    }

    return `type Url${interfaceName} = {
      ${ParamsList.map((v)=>{
        if (v.name === 'body') {
          return null;
        }
        return `${v.name}: ${v.type}`
      })}
    }`
}



const TransFormUrlRqustBody = (ParamsList, interfaceName) => {
  if (!ParamsList || Object.keys(ParamsList).length === 0) {
    return '';
  }
  return `type ${interfaceName}RequestBody = {
    ${Object.keys(ParamsList).map((v)=>`\n${v}: ${ParamsList[v]}\n`)}
  }`
}

const TransFormResponseData = (bodyLost, interfaceName)=>{
  if (!bodyLost || Object.keys(bodyLost).length === 0) {
    return '';
  }
  return `type ${interfaceName}ResponseData = {
    ${Object.keys(bodyLost).map((v)=>`\n${v}: ${bodyLost[v]}\n`)}
  }`
}

// 写入模板
const tplInsertApi = (apiInfo, callback) => {
  const keys = Object.keys(apiInfo);
  const method = keys[0];
  const methodParams = apiInfo[method];
  const parameters = methodParams.parameters;
  const operationId = methodParams.operationId;

  // const allPath = apiInfo.allPath;
  // const requestName = TransFormBig(moduleName(apiInfo.allPath.split('/')[2]));
  let reps = null;
  let repData = null;

  if (apiInfo.get?.parameters[1]) {
    const itemList = apiInfo.get.parameters[1].schema['$ref'].split('/');
    reps = repTypeMap.get(itemList[itemList.length - 1]);
  }

  if (apiInfo?.post) {
    const itemList = apiInfo.post.responses['200'].schema['$ref'].split('/');
    repData = repTypeMap.get(itemList[itemList.length - 1]);

  }

  if (apiInfo.get?.parameters && !reps && !repData) {
    callback(`
    {
      type: '${method}',
      Params: ${apiInfo.get?.parameters ? 'Url' + operationId: 'any'}
    }`)
  }else if(apiInfo.get?.parameters && reps && !repData){
    callback(`
    {
      type: '${method}',
      Params: ${apiInfo.get?.parameters ? 'Url' + operationId: 'any'},
      RequestBody: ${Object.keys(reps).length === 0 ? 'any' : operationId + 'RequestBody'}
    }`)
  }else if(apiInfo.get?.parameters && reps && repData){
    callback(`
    {
      type: '${method}',
      Params: ${apiInfo.get?.parameters ? 'Url' + operationId: 'any'},
      RequestBody: ${Object.keys(reps).length === 0 ? 'any' : operationId + 'RequestBody'}
      ResponseData: ${operationId + 'ResponseData'}
    }`)
  }else if(!apiInfo.get?.parameters && reps && !repData){
    callback(`
    {
      type: '${method}',
      RequestBody: ${Object.keys(reps).length === 0 ? 'any' : operationId + 'RequestBody'}
    }`)
  }else if(!apiInfo.get?.parameters && !reps && repData){
    callback(`
    {
      type: '${method}',
      ResponseData: ${operationId + 'ResponseData'}
    }`)
  } else {
    callback(`{
      type: '${method}'
    }
    `);
  }

  

  

  return `
  /**
    * @description ${methodParams.summary}
  */

  ${TransFormUrlParams(parameters, operationId)}

  ${TransFormUrlRqustBody(reps, operationId)}

  ${TransFormResponseData(repData, operationId)}

  `;
}


// 将命名转成驼峰命名
const TransFormBig = (name)=>{
  let isDouble = '';
  if (name.indexOf('_') !== -1) {
    let chatList = name.split('_')
    isDouble = chatList.map((v) => TransFormBig(v));
    isDouble = isDouble.join('');
    return isDouble;
  }
  const one = name.charAt(0);
  const OneTrs = one.toUpperCase();
  return OneTrs + name.slice(1);
}


// 模板名
const getModulesName = (apiInfo) => {
  const keys = Object.keys(apiInfo);
  const method = keys[0];
  const methodParams = apiInfo[method];
  const operationId = methodParams.operationId;
  return operationId;
}

// 写入tsx
const writeFileApi = (apiData) => {
  // index.tsx
  // let tplIndex = `import getUrl from '@/utils/getUrl';\nimport Request from '@/utils/request';\n`;
  const urlPathList = []
  let tplIndex = '';
  const apiDataLen = apiData.length;
  let moduleList = [];
  let urlPaths = new Map();
  for (let i = 0; i < apiDataLen; i++) {
    const item = apiData[i];
    let urlType = ''
    let text = tplInsertApi(item, (v)=> {
      urlType = v;
    });

    tplIndex = `${tplIndex}\n${text}\n`;
    urlPathList.push(item.allPath);

    urlPaths.set(item.allPath, urlType)
    moduleList.push(getModulesName(item));
  }
  tplIndex = beautify(tplIndex, { indent_size: 2, max_preserve_newlines: 2 });

  const template = `
  \n${tplIndex}\n
  export interface Paths {
    ${Array.from(urlPaths).map((v)=> `\n'${v[0]}': ${v[1]}\n`)}
  }
  `
  fs.writeFileSync(`${API_PATH}/index.ts`, template);
  return moduleList;
}


const gen = async () => {
  isExist();
  try {
    // 解析url 获得
    const parsed = await parse.parse(swaggerUrl);
    const typeList = Object.keys(parsed.definitions)
    for (const item of typeList) {
      const itemType =  Object.keys(parsed.definitions[item].properties)
      let setData = {}
      for (const typeTrs of itemType) {
         const valueType = parsed.definitions[item].properties[typeTrs]
         switch (valueType.type) {
           case 'integer':
            setData[typeTrs] = 'number'
             break;
           default:
            setData[typeTrs] = valueType.type
             break;
         }
      }
      repTypeMap.set(item, setData)
    }

    const paths = parsed.paths
    const pathsKeys = Object.keys(paths)	// 获取url路径
    const pathsKeysLen = pathsKeys.length
    const modulesMap = new Map()
    for (let i = 0; i < pathsKeysLen; i++) {
      const item = pathsKeys[i]
      const itemAry = item.split('/')
      const pathsItem = paths[item]
      let fileName = itemAry[3]
      if (!fileName) continue
      fileName = String(fileName).toLowerCase()
      // 创建模块目录
      isExist(fileName)
      // 完整路径
      pathsItem.allPath = item;
      if (modulesMap.has(fileName)) {
        const fileNameAry = modulesMap.get(fileName)
        fileNameAry.push(pathsItem)
        modulesMap.set(fileName, fileNameAry)
      } else {
        modulesMap.set(fileName, [pathsItem])
      }
    }
    getModules(modulesMap)
  } catch (e) {
    console.log(e)
  }
};

gen();