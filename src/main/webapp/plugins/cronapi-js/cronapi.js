(function() {
  'use strict';

  this.cronapi = {};

  this.doEval = function(arg) {
    return arg;
  }

  this.evalInContext = function(js) {
    var result = eval('doEval('+js+')');
    if (result && result.commands) {
      for (var i=0;i<result.commands.length;i++) {
        var func = eval(result.commands[i].function);
        func.apply(this, result.commands[i].params);
      }
    }
    if (result && result.value) {
      return result.value;
    }
  }

  /**
   * @category CategoryType.CONVERSION
   * @categoryTags Conversão|Convert
   */
  this.cronapi.conversion = {};

  /**
   * @type function
   * @name {{textToTextBinary}}
   * @nameTags asciiToBinary
   * @description {{functionToConvertTextInTextBinary}}
   * @param {ObjectType.STRING} astring {{contentInAscii}}
   * @returns {ObjectType.STRING}
   */
  this.cronapi.conversion.asciiToBinary = function(astring) {
    var binary = "";
    if (astring.length > 0) {
      for (var i = 0; i < astring.length; i++) {
        var value = astring.charCodeAt(i);
        for (var j = 7; j >= 0; j--) {
          binary += ((value >> j) & 1);
        }
      }
    }
    return binary;
  };

  /**
   * @type function
   * @name {{toLogic}}
   * @nameTags toBoolean
   * @description {{functionConvertToLogic}}
   * @param {ObjectType.STRING} value {{content}}
   * @returns {ObjectType.BOOLEAN}
   */
  this.cronapi.conversion.toBoolean = function(value) {
    return parseBoolean(value);
  };

  /**
   * @type function
   * @name {{convertToBytes}}
   * @nameTags toBytes
   * @description {{functionToConvertTextBinaryToText}}
   * @param {ObjectType.OBJECT} obj {{contentInTextBinary}}
   * @returns {ObjectType.STRING}
   */
  this.cronapi.conversion.toBytes = function(obj) {
    return obj ? obj.toString() : "";
  };

  /**
   * @type function
   * @name {{convertToAscii}}
   * @nameTags chrToAscii|convertToAscii
   * @description {{functionToConvertToAscii}}
   * @param {ObjectType.STRING} value {{content}}
   * @returns {ObjectType.STRING}
   */
  this.cronapi.conversion.chrToAscii = function(value) {
    if (!value) {
      return null;
    } else {
      return (value.charCodeAt(0));
    }
  };

  /**
   * @type function
   * @name {{convertStringToJs}}
   * @nameTags stringToJs
   * @description {{functionToConvertStringToJs}}
   * @param {ObjectType.STRING} value {{content}}
   * @returns {ObjectType.STRING}
   */
  this.cronapi.conversion.stringToJs = function(value) {
    return stringToJs(value);
  };

  /**
   * @type function
   * @name {{convertStringToDate}}
   * @nameTags stringToDate
   * @description {{functionToConvertStringToDate}}
   * @param {ObjectType.STRING} value {{content}}
   * @returns {ObjectType.DATETIME}
   */
  this.cronapi.conversion.stringToDate = function(value) {
    var pattern = /^\s*(\d+)[\/\.-](\d+)[\/\.-](\d+)(\s(\d+):(\d+):(\d+))?\s*$/;
    if (value) {
      if (value instanceof Date)
        return value;
      else if (pattern.test(value)) {
        var splited = pattern.exec(value);
        var userLang = (navigator.language || navigator.userLanguage)
            .split("-")[0];

        if (userLang == "pt" || userLang == "en") {
          var functionToCall = eval(userLang + "Date");
          return functionToCall(splited);
        } else
          return new Date(value);
      } else
        return new Date(value);
    }
    return null;
  };

  /**
   * @type function
   * @name {{convertIntToHex}}
   * @nameTags intToHex
   * @description {{functionToConvertIntToHex}}
   * @param {ObjectType.STRING} value {{content}}
   * @returns {ObjectType.STRING}
   */
  this.cronapi.conversion.intToHex = function(value) {
    return Number(value).toString(16).toUpperCase();
  };

  /**
   * @type function
   * @name {{convertToLong}}
   * @nameTags toLong
   * @description {{functionToConvertToLong}}
   * @param {ObjectType.OBJECT} value {{content}}
   * @returns {ObjectType.LONG}
   */
  this.cronapi.conversion.toLong = function(value) {
    return parseInt(value);
  };

  /**
   * @type function
   * @name {{convertToString}}
   * @nameTags toString
   * @description {{functionToConvertToString}}
   * @param {ObjectType.OBJECT} value {{content}}
   * @returns {ObjectType.STRING}
   */
  this.cronapi.conversion.toString = function(value) {
    if (value){
      var result = new String(value);
      return result.toString();
    }
    return "";
  };

  /**
   * @category CategoryType.UTIL
   * @categoryTags Util
   */
  this.cronapi.util = {};

  /**
   * @type internal
   * @name {{callServerBlocklyAsync}}
   * @nameTags callServerBlocklyAsync
   * @description {{functionToCallServerBlocklyAsync}}
   * @param {ObjectType.STRING} classNameWithMethod {{classNameWithMethod}}
   * @param {ObjectType.OBJECT} callbackSuccess {{callbackSuccess}}
   * @param {ObjectType.OBJECT} callbackError {{callbackError}}
   * @param {ObjectType.OBJECT} params {{params}}
   * @arbitraryParams true
   */
  this.cronapi.util.callServerBlocklyAsync = function(classNameWithMethod, fields, callbackSuccess, callbackError) {
    var serverUrl = 'api/cronapi/call/body/#classNameWithMethod#/'.replace('#classNameWithMethod#', classNameWithMethod);
    var http = cronapi.$scope.http;
    var params = [];
    $(arguments).each(function() {
      params.push(this);
    });

    var token = "";
    if (window.uToken)
      token = window.uToken;

    var dataCall = {
      "fields": fields,
      "inputs": params.slice(4)
    };

    var resultData = $.ajax({
      type: 'POST',
      url: serverUrl,
      dataType: 'html',
      data : JSON.stringify(dataCall),
      headers : {
        'Content-Type' : 'application/json',
        'X-AUTH-TOKEN' : token,
        'toJS' : true
      },
      success : callbackSuccess,
      error : callbackError
    });

  };

  /**
   * @type internal
   */
  this.cronapi.util.getScreenFields = function() {
    var fields = {};

    for (var key in cronapi.$scope) {
      if (cronapi.$scope[key] && cronapi.$scope[key].constructor && cronapi.$scope[key].constructor.name=="DataSet") {
        fields[key] = {};
        fields[key].active = cronapi.$scope[key].active;
      }
    }

    for (var key in cronapi.$scope.vars) {
      if (cronapi.$scope.vars[key]) {
        if (!fields.vars) {
          fields.vars = {};
        }
        fields.vars[key] = cronapi.$scope.vars[key];
      }
    }

    for (var key in cronapi.$scope.params) {
      if (cronapi.$scope.params[key]) {
        if (!fields.params) {
          fields.params = {};
        }
        fields.params[key] = cronapi.$scope.params[key];
      }
    }

    return fields;
  }

  function getErrorMessage(data, message) {
    try {
      var json = JSON.parse(data);
      if (json && json.error) {
        return json.error;
      }
    } catch(e) {
      //Abafa
    }

    return message;
  }

  /**
   * @type internal
   * @name {{makeCallServerBlocklyAsync}}
   * @nameTags makeCallServerBlocklyAsync
   * @description {{functionToMakeCallServerBlocklyAsync}}
   * @param {ObjectType.STRING} blocklyWithFunction {{blocklyWithFunction}}
   * @param {ObjectType.STRING} callbackBlocklySuccess {{callbackBlocklySuccess}}
   * @param {ObjectType.STRING} callbackBlocklyError {{callbackBlocklyError}}
   * @param {ObjectType.OBJECT} params {{params}}
   * @arbitraryParams true
   */
  this.cronapi.util.makeCallServerBlocklyAsync = function(blocklyWithFunction, callbackSuccess, callbackError) {
    var fields = this.getScreenFields();

    var paramsApply = [];
    paramsApply.push(blocklyWithFunction);
    paramsApply.push(fields);
    paramsApply.push(function(data) {
      var result = evalInContext(data);
      if (typeof callbackSuccess == "string") {
        eval(callbackSuccess)(result);
      } else if (callbackSuccess) {
        callbackSuccess(result);
      }
    });
    paramsApply.push(function(data, status, errorThrown) {
      var message = getErrorMessage(data.responseText, errorThrown);
      if (typeof callbackError == "string") {
        eval(callbackError)(message);
      }
      else if (callbackError) {
        callbackError(message);
      }
      else {
        cronapi.$scope.Notification.error(message);
      }
    });
    $(arguments).each(function(idx) {
      if (idx >= 3)
        paramsApply.push(this);
    });
    cronapi.util.callServerBlocklyAsync.apply(this, paramsApply);
  };

  /**
   * @type function
   * @name {{callServerBlockly}}
   * @nameTags callServerBlockly
   * @description {{functionToCallServerBlockly}}
   * @param {ObjectType.STRING} classNameWithMethod {{classNameWithMethod}}
   * @param {ObjectType.OBJECT} params {{params}}
   * @arbitraryParams true
   * @wizard procedures_callblockly_callnoreturn
   */
  this.cronapi.util.callServerBlocklyNoReturn = function() {
    cronapi.util.callServerBlockly.apply(this, arguments);
  }

  /**
   * @type function
   * @name {{throwExceptionName}}
   * @nameTags throwException
   * @description {{throwExceptionDescription}}
   * @param {ObjectType.OBJECT} value {{throwExceptionParam0}}
   */
  this.cronapi.util.throwException = function(value) {
    throw value;
  };



  /**
   * @type function
   * @name {{createExceptionName}}
   * @nameTags createException
   * @description {{createExceptionDescription}}
   * @param {ObjectType.STRING} value {{createExceptionParam0}}
   * @returns {ObjectType.STRING}
   */
  this.cronapi.util.createException = function(value) {
    return value;
  };

  /**
   * @type function
   * @name {{callServerBlockly}}
   * @nameTags callServerBlockly
   * @description {{functionToCallServerBlockly}}
   * @param {ObjectType.STRING} classNameWithMethod {{classNameWithMethod}}
   * @param {ObjectType.OBJECT} params {{params}}
   * @arbitraryParams true
   * @wizard procedures_callblockly_callreturn
   * @returns {ObjectType.OBJECT}
   */
  this.cronapi.util.callServerBlockly = function(classNameWithMethod) {
    var serverUrl = 'api/cronapi/call/body/#classNameWithMethod#/'.replace('#classNameWithMethod#', classNameWithMethod);
    var params = [];

    var fields = this.getScreenFields();

    var dataCall = {
      "fields": fields,
      "inputs": params
    };

    for (var i = 1; i<arguments.length; i++)
      params.push(arguments[i]);

    var token = "";
    if (window.uToken)
      token = window.uToken;

    var resultData = $.ajax({
      type: 'POST',
      url: serverUrl,
      dataType: 'html',
      data : JSON.stringify(dataCall),
      async: false,
      headers : {
        'Content-Type' : 'application/json',
        'X-AUTH-TOKEN' : token,
        'toJS' : true
      }
    });

    var result;
    if (resultData.status == 200) {
      if (resultData.responseJSON)
        result = resultData.responseJSON;
      else
        result = evalInContext(resultData.responseText);
    }
    else {
      var message = getErrorMessage(resultData.responseText, resultData.statusText);
      cronapi.$scope.Notification.error(message);
      throw message;
    }
    return result;
  };

  /**
   * @category CategoryType.SCREEN
   * @categoryTags Screen|Tela
   */
  this.cronapi.screen = {};

  /**
   * @type function
   * @name {{fieldNameFromScreen}}
   * @nameTags fieldNameFromScreen
   * @description {{functionToGetFieldNameFromScreen}}
   * @param {ObjectType.STRING} field {{field}}
   * @returns {ObjectType.OBJECT}
   * @wizard field_from_screen
   * @multilayer true
   */
  this.cronapi.screen.fieldFromScreen = function(field) {
    return field;
  };

  /**
   * @type function
   * @name {{changeValueOfField}}
   * @nameTags changeValueOfField|changeFieldValue
   * @description {{functionToChangeValueOfField}}
   * @param {ObjectType.STRING} field {{field}}
   * @param {ObjectType.STRING} value {{value}}
   * @multilayer true
   */
  this.cronapi.screen.changeValueOfField = function(/** @type {ObjectType.STRING} @blockType field_from_screen*/ field, /** @type {ObjectType.STRING} */value) {
    try {
      cronapi.$scope.__tempValue = value;
      var func = new Function('cronapi.$scope.' + field + ' = cronapi.$scope.__tempValue;');
      cronapi.$scope.safeApply(func.bind(cronapi.$scope));
    }
    catch (e) {
      alert(e);
    }
  };

  /**
   * @type function
   * @name {{getValueOfField}}
   * @nameTags getValueOfField|getFieldValue
   * @description {{functionToGetValueOfField}}
   * @param {ObjectType.STRING} field {{field}}
   * @returns {ObjectType.OBJECT}
   * @displayInline true
   */
  this.cronapi.screen.getValueOfField = function(/** @type {ObjectType.STRING} @blockType field_from_screen*/ field) {
    try {
      if (field && field.length > 0) {
        if (field.indexOf('vars.') > -1)
          return eval('cronapi.$scope.'+field);
        else
          return eval(field);
      }
      return '';
    }
    catch (e) {
      alert(e);
    }
  };

  /**
   * @type function
   * @name {{createScopeVariableName}}
   * @nameTags createScopeVariable
   * @description {{createScopeVariableDescription}}
   * @param {ObjectType.STRING} name {{createScopeVariableParam0}}
   * @param {ObjectType.STRING} value {{createScopeVariableParam1}}
   */
  this.cronapi.screen.createScopeVariable = function(name,value) {
    cronapi.$scope.vars[name] = value;
  };

  /**
   * @type function
   * @name {{getScopeVariableName}}
   * @nameTags getScopeVariable
   * @description {{getScopeVariableDescription}}
   * @param {ObjectType.STRING} name {{getScopeVariableParam0}}
   * @returns {ObjectType.STRING}
   */
  this.cronapi.screen.getScopeVariable = function(name) {
    return cronapi.$scope.vars[name];
  };

  /**
   * @type function
   * @name {{screenNotifyName}}
   * @param {ObjectType.STRING} type {{screenNotifyParam0}}
   * @param {ObjectType.STRING} message {{screenNotifyParam1}}
   * @wizard notify_type
   * @multilayer true
   */
  this.cronapi.screen.notify = function(/** @type {ObjectType.STRING} */ type, /** @type {ObjectType.STRING} */  message) {
    cronapi.$scope.Notification({'message':message },type);
  };

  /**
   * @type function
   * @name {{datasourceFromScreenName}}
   * @nameTags datasourceFromScreen
   * @description {{datasourceFromScreenDescription}}
   * @param {ObjectType.STRING} datasource {{datasourceFromScreenParam0}}
   * @returns {ObjectType.STRING}
   * @wizard datasource_from_screen
   * @multilayer true
   */
  this.cronapi.screen.datasourceFromScreen = function(datasource) {
    return datasource;
  };

  /**
   * @type function
   * @name {{startInsertingModeName}}
   * @nameTags startInsertingMode
   * @description {{startInsertingModeDescription}}
   * @param {ObjectType.STRING} datasource {{startInsertingModeParam0}}
   * @multilayer true
   */
  this.cronapi.screen.startInsertingMode = function(/** @type {ObjectType.OBJECT} @blockType datasource_from_screen*/ datasource) {
    window[datasource].startInserting();
    window[datasource].$apply();
  };

  /**
   * @type function
   * @name {{startEditingModeName}}
   * @nameTags startEditingMode
   * @description {{startEditingModeDescription}}
   * @param {ObjectType.STRING} datasource {{startEditingModeParam0}}
   * @multilayer true
   */
  this.cronapi.screen.startEditingMode = function(/** @type {ObjectType.OBJECT} @blockType datasource_from_screen*/ datasource) {
    window[datasource].$apply( new function(){window[datasource].startEditing();} );
  };

  /**
   * @type function
   * @name {{previusRecordName}}
   * @nameTags previusRecord
   * @description {{previusRecordDescription}}
   * @param {ObjectType.STRING} datasource {{previusRecordParam0}}
   * @multilayer true
   */
  this.cronapi.screen.previusRecord = function(/** @type {ObjectType.OBJECT} @blockType datasource_from_screen*/ datasource) {
    window[datasource].$apply( new function(){window[datasource].previous();} );
  };

  /**
   * @type function
   * @name {{nextRecordName}}
   * @nameTags nextRecord
   * @description {{nextRecordDescription}}
   * @param {ObjectType.STRING} datasource {{nextRecordParam0}}
   * @multilayer true
   */
  this.cronapi.screen.nextRecord = function(/** @type {ObjectType.OBJECT} @blockType datasource_from_screen*/ datasource) {
    window[datasource].$apply( new function(){window[datasource].next();} );
  };

  /**
   * @type function
   * @name {{removeRecordName}}
   * @nameTags removeRecord
   * @description {{removeRecordDescription}}
   * @param {ObjectType.STRING} datasource {{removeRecordParam0}}
   * @multilayer true
   */
  this.cronapi.screen.removeRecord = function(/** @type {ObjectType.OBJECT} @blockType datasource_from_screen*/ datasource) {
    window[datasource].$apply( new function(){window[datasource].remove();} );
  };


  /**
   * @type function
   * @name {{hasNextRecordName}}
   * @nameTags hasNextRecord
   * @description {{hasNextRecordDescription}}
   * @param {ObjectType.STRING} datasource {{hasNextRecordParam0}}
   * @returns {ObjectType.BOOLEAN}
   */
  this.cronapi.screen.hasNextRecord = function(/** @type {ObjectType.OBJECT} @blockType datasource_from_screen*/ datasource) {
    return window[datasource].hasNext();
  };

  /**
   * @type function
   * @name {{quantityRecordsName}}
   * @nameTags quantityRecords
   * @description {{quantityRecordsDescription}}
   * @param {ObjectType.STRING} datasource {{quantityRecordsParam0}}
   * @returns {ObjectType.LONG}
   */
  this.cronapi.screen.quantityRecords = function(/** @type {ObjectType.OBJECT} @blockType datasource_from_screen*/ datasource) {
    return window[datasource].data.length;
  };

  /**
   * @type function
   * @name {{datasourcePostName}}
   * @nameTags post|datasource
   * @description {{datasourcePostDescription}}
   * @param {ObjectType.STRING} datasource {{datasourcePostParam0}}
   * @multilayer true
   */
  this.cronapi.screen.post = function(/** @type {ObjectType.OBJECT} @blockType datasource_from_screen*/ datasource) {
    return window[datasource].post();
  };

  /**
   * @type function
   * @name {{datasourceFilterName}}
   * @nameTags filter|datasource
   * @description {{datasourceFilterDescription}}
   * @param {ObjectType.STRING} datasource {{datasourceFilterParam0}}
   * @param {ObjectType.STRING} datasource {{datasourceFilterParam1}}
   * @multilayer true
   */
  this.cronapi.screen.filter = function(/** @type {ObjectType.OBJECT} @blockType datasource_from_screen*/ datasource,/** @type {ObjectType.STRING}*/ path) {
    window[datasource].filter("/"+path);
  };
  
    /**
   * @type function
   * @name {{changeView}}
   * @nameTags changeView|Mudar tela|Change form|Change screen|Mudar formulário
   * @description {{functionToChangeView}}
   * @param {ObjectType.STRING} view {{view}}
   * @param {ObjectType.LIST} params {{params}}
   * @wizard procedures_open_form_callnoreturn
   * @multilayer true
   */
  this.cronapi.screen.changeView = function(view, params) {
    try {
      var queryString = '?';
      var template = '#key#=#value#&';
      $(params).each(function(idx) {
        for (var key in this)
          queryString += template.replace('#key#', Url.encode(key)).replace('#value#', Url.encode(this[key]));
      });
      window.location.hash = view + queryString;
    }
    catch (e) {
      alert(e);
    }
  };

  /**
   * @type function
   * @name {{openUrl}}
   * @nameTags openUrl|Abrir url
   * @description {{functionToOpenUrl}}
   * @param {ObjectType.STRING} url {{url}}
   * @param {ObjectType.BOOLEAN} newTab {{newTab}}
   * @param {ObjectType.LONG} width {{width}}
   * @param {ObjectType.LONG} height {{height}}
   * @multilayer true
   */
  this.cronapi.screen.openUrl = function(url, newTab, width, height) {
    try {
      var target = '_self';
      var params = '';
      if (newTab && newTab.toString().toLowerCase() == 'true')
        target = '_blank';
      if (width)
        params += 'width=' + width + ',';
      if (height)
        params += 'height=' + height+ ',';
      window.open(url, target, params);
    }
    catch (e) {
      alert(e);
    }
  };

  /**
   * @type function
   * @name {{getParam}}
   * @nameTags getParam|Obter paramêtro
   * @description {{functionToGetParam}}
   * @returns {ObjectType.STRING}
   * @param {ObjectType.STRING} paramName {{paramName}}
   */
  this.cronapi.screen.getParam = function(paramName) {
    try {
      return cronapi.$scope.params[paramName];
    }
    catch (e) {
      alert(e);
    }
  };


  /**
   * @type function
   * @name {{confirmDialogName}}
   * @nameTags confirmDialog|Confirmar
   * @description {{confirmDialogDescription}}
   * @returns {ObjectType.BOOLEAN}
   * @param {ObjectType.STRING} msg {{confirmDialogParam0}}
   */
  this.cronapi.screen.confimDialog = function(msg) {

    var value = confirm(msg);
    return value;
  };

  /**
   * @type function
   * @name {{createDefaultModalName}}
   * @nameTags createModal|Criar Modal| Modal
   * @description {{createDefaultModalDescription}}
   * @param {ObjectType.STRING} title {{createDefaultModalParam1}}
   * @param {ObjectType.STRING} msg {{createDefaultModalParam2}}
   * @param {ObjectType.STRING} buttonCancelName {{createDefaultModalParam3}}
   * @param {ObjectType.STRING} buttonSaveName {{createDefaultModalParam4}}
   *
   */
  this.cronapi.screen.createDefaultModal = function(title, msg, buttonCancelName, buttonSaveName, /** @type {ObjectType.STATEMENT} @description {{createDefaultModalParam5}} */ onSuccess, /** @type {ObjectType.STATEMENT} @description {{createDefaultModalParam6}}*/ onError) {
   $('#modalTemplateTitle').text(title);
   $('#modalTemplateBody').text(msg);
   $('#modalTemplateCancel').text(buttonCancelName);
   $('#modalTemplateSave').text(buttonSaveName);
   $( "modalTemplateClose").unbind( "click" );
   $('#modalTemplateClose').click(onError);
   $( "#modalTemplateCancel").unbind( "click" );
   $('#modalTemplateCancel').click(onError);
   $( "#modalTemplateSave").unbind( "click" );   
   $('#modalTemplateSave').click(onSuccess);
   $('#modalTemplate').modal('show');
   
  };


  /**
   * @category CategoryType.DATETIME
   * @categoryTags Date|Datetime|Data|Hora
   */
  this.cronapi.dateTime = {};

  /**
   * @type function
   * @name {{getSecondFromDate}}
   * @nameTags getSecond
   * @description {{functionToGetSecondFromDate}}
   * @param {ObjectType.DATETIME} value {{ObjectType.DATETIME}}
   * @returns {ObjectType.LONG}
   */
  this.cronapi.dateTime.getSecond = function(value) {
    var date = cronapi.conversion.stringToDate(value);
    if (date)
      return date.getSeconds();
    return 0;
  };

  /**
   * @type function
   * @name {{getMinuteFromDate}}
   * @nameTags getMinute
   * @description {{functionToGetMinuteFromDate}}
   * @param {ObjectType.DATETIME} value {{ObjectType.DATETIME}}
   * @returns {ObjectType.LONG}
   */
  this.cronapi.dateTime.getMinute = function(value) {
    var date = cronapi.conversion.stringToDate(value);
    if (date)
      return date.getMinutes();
    return 0;
  };

  /**
   * @type function
   * @name {{getHourFromDate}}
   * @nameTags getHour
   * @description {{functionToGetHourFromDate}}
   * @param {ObjectType.DATETIME} value {{ObjectType.DATETIME}}
   * @returns {ObjectType.LONG}
   */
  this.cronapi.dateTime.getHour = function(value) {
    var date = cronapi.conversion.stringToDate(value);
    if (date)
      return date.getHours();
    return 0;
  };

  /**
   * @type function
   * @name {{getYearFromDate}}
   * @nameTags getYear
   * @description {{functionToGetYearFromDate}}
   * @param {ObjectType.DATETIME} value {{ObjectType.DATETIME}}
   * @returns {ObjectType.LONG}
   */
  this.cronapi.dateTime.getYear = function(value) {
    var date = cronapi.conversion.stringToDate(value);
    if (date)
      return date.getFullYear();
    return 0;
  };

  /**
   * @type function
   * @name {{getMonthFromDate}}
   * @nameTags getMonth
   * @description {{functionToGetMonthFromDate}}
   * @param {ObjectType.DATETIME} value {{ObjectType.DATETIME}}
   * @returns {ObjectType.LONG}
   */
  this.cronapi.dateTime.getMonth = function(value) {
    var date = cronapi.conversion.stringToDate(value);
    if (date)
      return date.getMonth() + 1;
    return 0;
  };

  /**
   * @type function
   * @name {{getDayFromDate}}
   * @nameTags getDay
   * @description {{functionToGetDayFromDate}}
   * @param {ObjectType.DATETIME} value {{ObjectType.DATETIME}}
   * @returns {ObjectType.LONG}
   */
  this.cronapi.dateTime.getDay = function(value) {
    var date = cronapi.conversion.stringToDate(value);
    if (date)
      return date.getDate();
    return 0;
  };

  /**
   * @type function
   * @name {{getDaysBetweenDates}}
   * @nameTags getDaysBetweenDates|getDaysDiffDate|diffDatesDays
   * @description {{functionToGetDaysBetweenDates}}
   * @param {ObjectType.DATETIME} date {{largerDateToBeSubtracted}}
   * @param {ObjectType.DATETIME} date2 {{smallerDateToBeSubtracted}}
   * @returns {ObjectType.LONG}
   */
  this.cronapi.dateTime.getDaysBetweenDates = function(date, date2) {
    var DAY_IN_MILLIS = 1000 * 60 * 60 * 24;
    var dateVar = cronapi.conversion.stringToDate(date);
    var date2Var = cronapi.conversion.stringToDate(date2);
    var daysBetween = Math.round((dateVar.getTime() - date2Var.getTime())
        / DAY_IN_MILLIS);
    return daysBetween;
  };

  /**
   * @type function
   * @name {{getMonthsBetweenDates}}
   * @nameTags getMonthsBetweenDates|getMonthsDiffDate|diffDatesMonths
   * @description {{functionToGetMonthsBetweenDates}}
   * @param {ObjectType.DATETIME} date {{largerDateToBeSubtracted}}
   * @param {ObjectType.DATETIME} date2 {{smallerDateToBeSubtracted}}
   * @returns {ObjectType.LONG}
   */
  this.cronapi.dateTime.getMonthsBetweenDates = function(date, date2) {
    var monthBetween = 0;
    var yearBetween = 0;
    var dateVar = cronapi.conversion.stringToDate(date);
    var date2Var = cronapi.conversion.stringToDate(date2);
    if (dateVar && date2Var) {
      yearBetween = (dateVar.getFullYear() - date2Var.getFullYear()) * 12;
      monthBetween = dateVar.getMonth() - date2Var.getMonth();
      monthBetween += yearBetween;
      if (date2Var < dateVar && dateVar.getDate() < date2Var.getDate())
        monthBetween--;
      else if (date2Var > dateVar
          && dateVar.getDate() > date2Var.getDate())
        monthBetween++;
    }
    return monthBetween;
  };

  /**
   * @type function
   * @name {{getYearsBetweenDates}}
   * @nameTags getYearsBetweenDates|getYearsDiffDate|diffDatesYears
   * @description {{functionToGetYearsBetweenDates}}
   * @param {ObjectType.DATETIME} date {{largerDateToBeSubtracted}}
   * @param {ObjectType.DATETIME} date2 {{smallerDateToBeSubtracted}}
   * @returns {ObjectType.LONG}
   */
  this.cronapi.dateTime.getYearsBetweenDates = function(date, date2) {
    var yearBetween = 0;
    var dateVar = cronapi.conversion.stringToDate(date);
    var date2Var = cronapi.conversion.stringToDate(date2);
    if (dateVar && date2Var) {
      yearBetween = (dateVar.getFullYear() - date2Var.getFullYear());
      if (date2Var < dateVar
          && (dateVar.getDate() < date2Var.getDate() || dateVar
              .getMonth() < date2Var.getMonth()))
        yearBetween--;
      else if (date2Var > dateVar
          && (dateVar.getDate() > date2Var.getDate() || dateVar
              .getMonth() > date2Var.getMonth()))
        yearBetween++;
    }
    return yearBetween;
  };

  /**
   * @type function
   * @name {{incDay}}
   * @nameTags incDay|increaseDay
   * @description {{functionToIncDay}}
   * @param {ObjectType.DATETIME} date {{ObjectType.DATETIME}}
   * @param {ObjectType.LONG} day {{daysToIncrement}}
   * @returns {ObjectType.DATETIME}
   */
  this.cronapi.dateTime.incDay = function(date, day) {
    var dateVar = cronapi.conversion.stringToDate(date);
    dateVar.setDate(dateVar.getDate() + day);
    return dateVar;
  };

  /**
   * @type function
   * @name {{incMonth}}
   * @nameTags incMonth|increaseMonth
   * @description {{functionToIncMonth}}
   * @param {ObjectType.DATETIME} date {{ObjectType.DATETIME}}
   * @param {ObjectType.LONG} month {{monthsToIncrement}}
   * @returns {ObjectType.DATETIME}
   */
  this.cronapi.dateTime.incMonth = function(date, month) {
    var dateVar = cronapi.conversion.stringToDate(date);
    dateVar.setMonth(dateVar.getMonth() + month);
    return dateVar;
  };

  /**
   * @type function
   * @name {{incYear}}
   * @nameTags incYear|increaseYear
   * @description {{functionToIncYear}}
   * @param {ObjectType.DATETIME} date {{ObjectType.DATETIME}}
   * @param {ObjectType.LONG} year {{yearsToIncrement}}
   * @returns {ObjectType.DATETIME}
   */
  this.cronapi.dateTime.incYear = function(date, year) {
    var dateVar = cronapi.conversion.stringToDate(date);
    dateVar.setFullYear(dateVar.getFullYear() + year);
    return dateVar;
  };

  /**
   * @type function
   * @name {{getNow}}
   * @nameTags getNow|now|getDate
   * @description {{functionToGetNow}}
   * @returns {ObjectType.DATETIME}
   */
  this.cronapi.dateTime.getNow = function() {
    return new Date();
  };

  /**
   * @type function
   * @name {{formatDateTime}}
   * @nameTags formatDateTime
   * @description {{functionToFormatDateTime}}
   * @param {ObjectType.DATETIME} date {{ObjectType.DATETIME}}
   * @param {ObjectType.STRING} format {{format}}
   * @returns {ObjectType.STRING}
   */
  this.cronapi.dateTime.formatDateTime = function(date, format) {
    var dateVar = cronapi.conversion.stringToDate(date);
    var dd = dateVar.getDate();
    var mm = dateVar.getMonth() + 1;
    var yyyy = dateVar.getFullYear();
    var	separator = '';
    var maskChars = 'dmy';
    for (var i = 0; i < format.length; i++) {
      if (!maskChars.includes(format.toLowerCase().charAt(i))) {
        separator = format.toLowerCase().charAt(i);
        var formatLower = replaceAll(format.toLowerCase(), separator, '+separator+');
        return eval(formatLower);
      }
    }
    return '';
  };

  /**
   * @type function
   * @name {{newDate}}
   * @nameTags newDate|createDate
   * @description {{functionToNewDate}}
   * @param {ObjectType.LONG} year {{year}}
   * @param {ObjectType.LONG} month {{month}}
   * @param {ObjectType.LONG} month {{day}}
   * @param {ObjectType.LONG} hour {{hour}}
   * @param {ObjectType.LONG} minute {{minute}}
   * @param {ObjectType.LONG} second {{second}}
   * @returns {ObjectType.STRING}
   */
  this.cronapi.dateTime.newDate = function(year, month, day, hour, minute, second) {
    var date = new Date();
    date.setYear(year);
    date.setMonth(month - 1);
    date.setDate(day);
    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(second);
    return date;
  };

  /**
   * @type function
   * @name {{getValueIsNotNumber}}
   * @nameTags getValueIsNotNumber
   * @description {{functionToGetValueIsNotNumber}}
   * @param {ObjectType.STRING} str {{content}}
   * @returns {ObjectType.STRING}
   */
  this.cronapi.dateTime.getValueIsNotNumber = function(str) {
    var numbers = '0123456789';
    for (var i = 0; i < str.length; i++)
      if (!numbers.includes(str.charAt(i)))
        return str.charAt(i);
    return '';
  };
  
  /**
  * @category CategoryType.TEXT
  * @categoryTags TEXT|text
  */
  this.cronapi.text = {};
  
   /**
  * @type function
  * @wizard text_prompt_ext
  */
  this.cronapi.text.prompt = function(/** @type {ObjectType.STRING} @defaultValue abc*/ value) {
    return null;
  }

  /**
   * @category CategoryType.XML
   * @categoryTags XML|xml
   */
  this.cronapi.xml = {};

  /**
   * @type function
   * @name {{XMLGetElementValueName}}
   * @nameTags XMLGetElementValue
   * @description {{XMLGetElementValueDescription}}
   * @param {ObjectType.OBJECT} node {{XMLGetElementValueParam0}}
   * @returns {ObjectType.STRING}
   */
  this.cronapi.xml.XMLGetElementValue = function(node) {
    if (node.firstChild)
      return node.firstChild.nodeValue;
    else
      return null;
  };

  /**
   * @type function
   * @name {{XMLGetChildElementName}}
   * @nameTags XMLGetChildElement
   * @description {{XMLGetChildElementDescription}}
   * @param {ObjectType.OBJECT} node {{node}}
   * @param {ObjectType.STRING} childName {{childName}}
   * @returns {ObjectType.STRING}
   */
  this.cronapi.xml.XMLGetChildElement = function(node, childName) {
    var c = node.getElementsByTagName(childName);
    if (c.length > 0)
      return c[0];
  };

  /**
   * @type function
   * @name {{XMLGetRootName}}
   * @nameTags XMLGetRoot
   * @description {{XMLGetRootDescription}}
   * @param {ObjectType.OBJECT} element {{element}}
   * @returns {ObjectType.OBJECT}
   */
  this.cronapi.xml.XMLGetRoot = function(element) {
    if (element)
      return doc.documentElement;
  };

  /**
   * @type function
   * @name {{XMLGetAttributeName}}
   * @nameTags XMLGetAttribute
   * @description {{XMLGetAttributeDescription}}
   * @param {ObjectType.OBJECT} element  {{element}} 
   * @param {ObjectType.OBJECT} attribute  {{attribute}}
   * @returns {ObjectType.STRING}
   */
  this.cronapi.xml.XMLGetAttribute = function(element, attribute) {
    return node.getAttribute(attribute);
  };

  /**
   * @type function
   * @name {{XMLOpenName}}
   * @nameTags XMLOpen
   * @description {{XMLOpenDescription}}
   * @param {ObjectType.OBJECT} XMLText {{XMLOpenParam0}}
   * @returns {ObjectType.OBJECT}
   */
  this.cronapi.xml.XMLOpen = function(XMLText) {
    var doc = null;
    if (document.implementation && document.implementation.createDocument) { //Mozzila
      var domParser = new DOMParser();
      doc = domParser.parseFromString(XMLText, 'application/xml');
      return doc;
    } else {
      doc = new ActiveXObject("MSXML2.DOMDocument");
      doc.loadXML(XMLText);
    }
    return doc;
  };

  /**
   * @type function
   * @name {{XMLGetChildrenElementName}}
   * @nameTags XMLGetChildrenElement
   * @description {{XMLGetChildrenElementDescription}}
   * @param {ObjectType.OBJECT} node {{node}}
   * @param {ObjectType.OBJECT} childName {{childName}}
   * @returns {ObjectType.OBJECT}
   */
  this.cronapi.xml.XMLGetChildrenElement = function(node, childName) {
    if (childName) {
      return node.getElementsByTagName(childName);
    } else {
      return node.childNodes;
    }
  };

  /**
   * @type function
   * @name {{XMLGetParentElementName}}
   * @nameTags XMLGetParentElement
   * @description {{XMLGetParentElementDescription}}
   * @param {ObjectType.OBJECT} node {{node}}
   * @returns {ObjectType.OBJECT}
   */
  this.cronapi.xml.XMLGetParentElement = function XMLGetParentElement(node) {
    return node.parentNode;
  };

  /**
   * @type function
   * @name {{XMLGetElementTagNameName}}
   * @nameTags XMLGetElementTagName
   * @description {{XMLGetElementTagNameDescription}}
   * @param {ObjectType.OBJECT} node {{node}}
   * @returns {ObjectType.STRING}
   */
  this.cronapi.xml.XMLGetElementTagName = function XMLGetElementTagName(node) {
    return node.tagName;
  };
  
  
  this.cronapi.i18n = {};

  this.cronapi.i18n.translate = function(value , params) {
    if (value) {
      var text = cronapi.$translate.instant(value);
      for (var i = 0; i < params.length; i++){
        var param = params[i];
        if (param != null && typeof param != "undefined") {
          var regexp = new RegExp("\\{" + (i) + "\\}", "g");
          text = text.replace(regexp, param);
        }
      }
      return text;
    }
    return;
  };

  //Private variables and functions
  var ptDate = function(varray) {
    var date;
    var day = varray[1];
    var month = varray[2];
    var year = varray[3];
    var hour = varray[5];
    var minute = varray[6];
    var second = varray[7];
    if (hour)
      date = new Date(year, month - 1, day, hour, minute, second);
    else
      date = new Date(year, month - 1, day, 0, 0, 0);
    return date;
  };

  var enDate = function(varray) {
    var date;
    var month = varray[1];
    var day = varray[2];
    var year = varray[3];
    var hour = varray[5];
    var minute = varray[6];
    var second = varray[7];
    if (hour)
      date = new Date(year, month - 1, day, hour, minute, second);
    else
      date = new Date(year, month - 1, day, 0, 0, 0);
    return date;
  };

  var parseBoolean = function(value) {
    if (!value)
      return false;
    if (typeof value == "boolean")
      return value;
    value = value.toString().toLowerCase().trim();
    return value == "1" || value == "true";
  };

  var removeAccents = function(value) {
    withAccents = 'áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÖÔÚÙÛÜÇ';
    withoutAccents = 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC';
    newValue = '';
    for (i = 0; i < value.length; i++) {
      if (withAccents.search(value.substr(i, 1)) >= 0) {
        newValue += withoutAccents.substr(withAccents.search(value
            .substr(i, 1)), 1);
      } else {
        newValue += value.substr(i, 1);
      }
    }
    return newValue;
  };

  var arrayRemove = function(array, value) {
    var i = arrayIndexOf(array, value);
    if (i != -1) {
      array.splice(i, 1);
    }
  };

  var arrayIndexOf = function(array, value) {
    var index = -1;
    $(array).each(function(idx) {
      if (value == this) {
        index = idx;
      }
    });
    return index;
  };

  var replaceAll = function(str, value, newValue) {
    return str.toString().split(value).join(newValue);
  };

  var getWindowHeight = function() {
    $(window).height();
  };

  var getWindowWidth = function() {
    $(window).width();
  };

  /**
   *
   *  URL encode / decode
   *  http://www.webtoolkit.info/
   *
   **/

  var Url = {
    // public method for url encoding
    encode : function (string) {
      if (string)
        return escape(this._utf8_encode(string));
      return '';
    },
    // public method for url decoding
    decode : function (string) {
      if (string)
        return this._utf8_decode(unescape(string));
      return '';
    },
    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
      string = string.replace(/\r\n/g,"\n");
      var utftext = "";
      for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
          utftext += String.fromCharCode(c);
        }
        else if((c > 127) && (c < 2048)) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }
      return utftext;
    },
    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
      var string = "";
      var i = 0;
      var c = c1 = c2 = 0;
      while ( i < utftext.length ) {
        c = utftext.charCodeAt(i);
        if (c < 128) {
          string += String.fromCharCode(c);
          i++;
        }
        else if((c > 191) && (c < 224)) {
          c2 = utftext.charCodeAt(i+1);
          string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
          i += 2;
        }
        else {
          c2 = utftext.charCodeAt(i+1);
          c3 = utftext.charCodeAt(i+2);
          string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          i += 3;
        }
      }
      return string;
    }
  };

  var stringToJs = function(str) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
  };

}).bind(window)();