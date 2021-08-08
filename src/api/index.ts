
  
/**
 * @description 获取单个用户
 */

type UrlUserSing = {
  name: string,
}

type UserSingRequestBody = {

  deploy_env: string,
  description: string,
  gitlab_branch_name: string,
  gitlab_ci_template_id: number,
  gitlab_id: number,
  gitlab_type: number,
  is_auto_release: number,
  name: string

}

/**
 * @description 获取单个用户
 */

type UrlUserMobile = {
  name: string
}

/**
 * @description 获取单个用户
 */

type UserRegisteredResponseData = {

  name: string,
  say: number

}

  export interface Paths {
    
'/api/user/{name}': 
    {
      type: 'get',
      Params: UrlUserSing,
      RequestBody: UserSingRequestBody
    }
,
'/api/user_mobile/{name}': 
    {
      type: 'get',
      Params: UrlUserMobile
    }
,
'/api/user_registered/{name}': 
    {
      type: 'post',
      ResponseData: UserRegisteredResponseData
    }

  }
  