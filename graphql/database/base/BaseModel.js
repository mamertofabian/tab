
import dynogels from 'dynogels'
import { NotImplementedException } from '../../utils/exceptions'
import dbClient from '../databaseClient'

dynogels.documentClient(dbClient)

class BaseModel {
  /**
   * The name of the model.
   * You are required to override this function on the child class.
   * @return {string} The name of the model.
   */
  static get name () {
    throw new NotImplementedException()
  }

  /**
   * The name of the database table.
   * You are required to override this function on the child class.
   * @return {string} The name of the database table.
   */
  static get tableName () {
    throw new NotImplementedException()
  }

  /**
   * The name of the hashKey for the DynamoDB table.
   * You are required to override this function on the child class.
   * @return {string} The name of the hashKey for the DynamoDB table.
   */
  static get hashKey () {
    throw new NotImplementedException()
  }

  /**
   * The table schema, used in dynogels.
   * You are required to override this function on the child class.
   * @return {object} The table schema.
   */
  static get schema () {
    throw new NotImplementedException()
  }

  /**
   * The permissions object, used to check authorization for database
   * operations. By default, no operations are authorized.
   * @return {object} The permissions object, with a key for each
   *   operation name. Each property value is a function that receives
   *   a user object, item hashKey, and item rangeKey, and must return
   *   a boolean for whether the query is authorized.
   */
  static get permissions () {
    return {
      get: (user, hashKeyValue, rangeKeyValue) => false,
      getAll: () => false,
      update: (user, hashKeyValue, rangeKeyValue) => false,
      create: (user, hashKeyValue) => false
    }
  }

  /**
   * Register the model with dynogels. This must be called prior to
   * using any methods that query the database.
   * @return {undefined}
   */
  static register () {
    console.log(`Registering model ${this.name} to table ${this.tableName}.`)
    this.dynogelsModel = dynogels.define(this.name, {
      hashKey: this.hashKey,
      tableName: this.tableName,

      // Add two timestamps, `created` and `updated`, to
      // the item's fields.
      timestamps: true,
      createdAt: 'created',
      updatedAt: 'updated',

      schema: this.schema
    })
  }

  // TODO: support rangeKey
  static get (hashKey, rangeKey, options) {
    console.log(`Getting obj with hashKey ${hashKey} from table ${this.tableName}.`)
    const self = this
    return new Promise((resolve, reject) => {
      this.dynogelsModel.get(hashKey, (err, obj) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          resolve(self.deserialize(obj))
        }
      })
    })
  }

  static getAll () {
    console.log(`Getting all objs in table ${this.tableName}.`)
    const self = this
    return new Promise((resolve, reject) => {
      this.dynogelsModel.scan().exec((err, objs) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          resolve(self.deserialize(objs.Items))
        }
      })
    })
  }

  static create (...args) {
    console.log(`Creating item in ${this.tableName} with args ${JSON.stringify(...args, null, 2)}`)
    const self = this
    return new Promise((resolve, reject) => {
      this.dynogelsModel.create(...args, (err, obj) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          resolve(self.deserialize(obj))
        }
      })
    })
  }

  /**
   * Return a modified object or list of object from the
   * database item or items.
   * @param {Object || Object[]} obj - The database object or list of objects.
   * @return {Object | Object[]} An instance of `this`, with the attributes
   *   of `obj` and possibly some additional default attributes.
  */
  static deserialize (obj) {
    // TODO: use default values for missing fields
    const deserializeObj = (obj) => {
      // Create an instance of the model class so that we can use
      // the class type in `nodeDefinitions` in schema.
      const Cls = this
      const newItem = new Cls()
      for (var attr in obj.attrs) {
        newItem[attr] = obj.attrs[attr]
      }
      return newItem
    }

    var result
    if (obj instanceof Array) {
      result = []
      for (var index in obj) {
        result.push(deserializeObj(obj[index]))
      }
    } else {
      result = deserializeObj(obj)
    }
    return result
  }

  /**
   * Determine whether the user is authorized to make a particular
   * database query.
   * @param {obj} user - The user object passed as context
   * @param {string} operation - The operation type (e.g. "get" or "update")
   * @param {string} hashKeyValue - The value of the item hashKey in the query
   * @param {string} rangeKeyValue - The value of the item rangeKey in the query
   * @return {boolean} Whether the user is authorized.
   */
  static isQueryAuthorized (user, operation, hashKeyValue, rangeKeyValue) {
    const validOperations = [
      'get',
      'getAll',
      'update',
      'create'
    ]
    if (validOperations.indexOf(operation) === -1) {
      return false
    }

    // Get the permissions from the model class. If no permissions are
    // defined, do not allow any access.
    const permissions = this.permissions
    if (!permissions) {
      return false
    }

    // Get the authorizer function from the model class for this operation.
    // If the function does not exist, do not allow any access.
    const authorizerFunction = permissions[operation]
    if (!authorizerFunction || !(typeof authorizerFunction === 'function')) {
      return false
    }

    // If the authorizer function returns `true`, the query is authorized.
    return authorizerFunction(user, hashKeyValue, rangeKeyValue) === true
  }
}

export default BaseModel
