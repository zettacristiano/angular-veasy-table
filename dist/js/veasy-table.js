'use strict';

angular.module('veasy.table', [
  'ngSanitize',
  'veasy.table.templates'
]);

angular.module('veasy.table')

  .filter('url', ['$sanitize', function ($sanitize) {
    return function (input, text, target) {
      // if (!text) {
      //   var matches = input.match(/\w+:\/\/([\w|\.]+)/);
      //   if (matches) text = matches[0];
      // }
      // return $sanitize('<a target="' + target + '" href="' + input + '">' + text + '</a>');

      return $sanitize('<a target="' + target + '" href="' + input + '">' + input + '</a>');
    };
  }]);

angular.module('veasy.table')

  .service('checkboxService', ['$timeout', function ($timeout) {

    var resetCheckboxesToInitialState = function (list) {
      var checkboxes = [];
      for (var i = 0; i < list.length; i++) {
        for (var j = 0; j < list[i].length; j++) {
          checkboxes[i] = [];
          checkboxes[i][j] = false;
        }
      }
      return checkboxes;
    };

    var defineCheckboxMasterState = function (selector, checkboxes, page) {
      var checked = false;
      var unchecked = false;

      angular.forEach(checkboxes[page], function (value, index) {
        if (value) checked = true;
        else unchecked = true;
      });

      return defineCheckboxState(selector, checked, unchecked);
    };

    var defineCheckboxState = function (selector, checked, unchecked) {
      if (checked && unchecked) {
        defineIndeterminateStage(selector, true);
        return false;
      }

      if (checked) {
        defineIndeterminateStage(selector, false);
        return true;
      }

      if (unchecked) {
        defineIndeterminateStage(selector, false);
        return false;
      }
    };

    var defineIndeterminateStage = function(selector, value) {
      angular.element(selector).prop('indeterminate', value);
    };

    return {
      reset: resetCheckboxesToInitialState,
      defineCheckboxMasterState: defineCheckboxMasterState,
      defineCheckboxState: defineCheckboxState
    };

  }]);

angular.module('veasy.table')

.service('columnService', [ function () {

  var haveHiddenColumn = function(columns) {
    if (!columns) return;

    return columns.some(function(column) {
      return column.isHidden;
    });
  };

  var openRow = function(rows, index, parentIndex, parentRow, columns) {
    rows.splice(index, 0, { rowIndex: index, isToggleable: true });
  };

  var closeRow = function(rows, index) {
    rows.splice(index, 1);
  };

  var openedRows = function(rows) {
    if (!rows) return;

    return rows.filter(function(row) {
      return row.isToggleable;
    });
  };

  var closeAllOpenedRows = function(rows, activeRowIndex) {
    var rowsToClose = openedRows(rows);

    if (!rowsToClose) return;

    for (var i = 0; i < rowsToClose.length; i++) {
      if (rowsToClose[i].rowIndex !== activeRowIndex)
        closeRow(rows, rows.indexOf(rowsToClose[i]));
    }
  };

  var defineToggleRowColspan = function(columns) {
    var filteredColumns = columns.filter(function(column) {
      return !column.isHidden;
    }) || [];
    
    return filteredColumns.length + 1;
  };

  var getHiddenContent = function (parentRow, columns) {
    var hiddenContent = [];

    columns.forEach(function (column) {
      if (column.isHidden)
        hiddenContent.push({ header: column.header, value: parentRow[column.value], filter: column.filter });
    });

    return hiddenContent;
  };

  return {
    openRow: openRow,
    closeRow: closeRow,
    closeAllOpenedRows: closeAllOpenedRows,
    haveHiddenColumn: haveHiddenColumn,
    defineToggleRowColspan: defineToggleRowColspan,
    getHiddenContent: getHiddenContent
  };

}]);

angular.module('veasy.table')

  .service('configService', [ function () {

    var validateConfigs = function (config) {
      if (!config) config = {};
      if (!config.columns) config.columns = [];

      config.id = validateIdConfig(config.id);
      config.toggleColumns = validateToggleColumnsConfig(config.toggleColumns);
      config.checkbox = validateCheckboxConfig(config.checkbox);
      config.sort = validateSortConfig(config.sort);
      config.pagination = validatePaginationConfig(config.pagination);
      config.filter = validateFilterConfig(config.filter);
      config.columnFilter = validateColumnFilterConfig(config.columnFilter);
      config.labels = validateTranslationConfig(config.labels);
      return config;
    };

    var validateIdConfig = function(id) {
      if (!id) return generateRandomId();
    };

    var generateRandomId = function() {
      var number = Math.round(Math.random()*4 * 100000);
      var newId = 'veasy-table-' + number;
      var elements = angular.element('table#' + newId);
      
      if (elements && elements.length > 0)
        generateRandomId();

      return newId;
    };

    var validateToggleColumnsConfig = function (toggleColumns) {
      if (!toggleColumns) toggleColumns = {};
      if (!toggleColumns.enable) toggleColumns.enable = false;
      if (!toggleColumns.position) toggleColumns.position = false;
      if (!toggleColumns.icons) toggleColumns.icons = {};
      if (!toggleColumns.icons.opened) toggleColumns.icons.opened = 'fa fa-chevron-down';
      if (!toggleColumns.icons.closed) toggleColumns.icons.closed = 'fa fa-chevron-left';
      return toggleColumns;
    };

    var validateCheckboxConfig = function (checkbox) {
      if (!checkbox) checkbox = {};
      if (!checkbox.enable) checkbox.enable = false;
      return checkbox;
    };

    var validateSortConfig = function (sort) {
      if (!sort) sort = {};
      if (!sort.enable) sort.enable = false;
      return sort;
    };

    var validatePaginationConfig = function (pagination) {
      if (!pagination) pagination = {};
      if (!pagination.enable) pagination.enable = false;
      if (!pagination.currentPage) pagination.currentPage = 0;
      if (!pagination.itemsPerPage) pagination.itemsPerPage = 10;
      return pagination;
    };

    var validateFilterConfig = function (filter) {
      if (!filter) filter = {};
      if (!filter.enable) filter.enable = false;
      if (!filter.conditional) filter.conditional = false;
      if (!filter.delay) filter.delay = 500;
      return filter;
    };

    // FIXME: REFATORAR
    var validateColumnFilterConfig = function (columnFilter) {
      if (!columnFilter) columnFilter = {};
      if (!columnFilter.enable) columnFilter.enable = false;
      if (!columnFilter.modalOptions) columnFilter.modalOptions = {};
      if (!columnFilter.modalOptions.size) columnFilter.modalOptions.size = 'md';
      if (!columnFilter.modalOptions.autoOpen) columnFilter.modalOptions.autoOpen = false;
      if (!columnFilter.modalOptions.keyboard) columnFilter.modalOptions.keyboard = true;
      if (!columnFilter.modalOptions.backdrop) columnFilter.modalOptions.backdrop = true;
      return columnFilter;
    };

    var validateTranslationConfig = function (labels) {
      if (!labels) labels = {};
      if (!labels.filter) labels.filter = {};
      if (!labels.filter.by) labels.filter.by = 'Filter by...';
      if (!labels.filter.all) labels.filter.all = 'All';
      if (!labels.filter.and) labels.filter.and = 'AND';
      if (!labels.filter.or) labels.filter.or = 'OR';
      if (!labels.pagination) labels.pagination = {};
      if (!labels.pagination.itemsPerPage) labels.pagination.itemsPerPage = 'Items by Page';
      if (!labels.pagination.totalItems) labels.pagination.totalItems = 'Total of Items';
      if (!labels.modal) labels.modal = {};
      if (!labels.modal.title) labels.modal.title = 'Which columns you want to display?';
      if (!labels.modal.okButton) labels.modal.okButton = 'Apply';
      if (!labels.modal.cancelButton) labels.modal.cancelButton = 'Cancel';
      return labels;
    };

    return {
      validate: validateConfigs
    };

  }]);

angular.module('veasy.table')

  .service('modalService', [ 'checkboxService', '$timeout', function (checkboxService, $timeout) {

    var getmodalId = function (id) {
      return id.replace(/veasy-table-/gi, 'veasy-table-modal-');
    };

    var initMasterCheckbox = function (modalId, modalColumns) {
      var checkboxMaster = {};

      modalColumns.forEach(function (col) {
        var selector = '#' + modalId + ' input#cbMaster-' + col.value;
        $timeout(function () {
          checkboxMaster[col.value] = defineMasterCheckboxState(selector, col);
        }, 0);
      });

      return checkboxMaster;
    };

    var defineMasterCheckboxState = function (selector, column) {
      var checked = false;
      var unchecked = false;

      angular.forEach(column.hideOn, function (size) {
        if (size) checked = true;
        else unchecked = true;
      });

      return checkboxService.defineCheckboxState(selector, checked, unchecked);
    };

    var getColumns = function (columns) {
      return columns.map(function (column) {
        var sizeArray = column.hideOn.split(' ');

        return {
          header: column.header,
          value: column.value,
          hideOn: {
            lg: isVisibleColumn(sizeArray, 'lg'),
            md: isVisibleColumn(sizeArray, 'md'),
            sm: isVisibleColumn(sizeArray, 'sm'),
            xs: isVisibleColumn(sizeArray, 'xs')
          }
        };
      });
    };

    var isVisibleColumn = function (array, size) {
      return array.indexOf(size) === -1;
    };

    var updateColumnsVisibility = function (configColumns, modalColumns) {
      var columns = angular.copy(configColumns);
      var hide = {};

      modalColumns.forEach(function (col) {
        var hideOn = '';
        for (var prop in col.hideOn) {
          if (!col.hideOn[prop]) {
            hideOn += prop + ' ';
          }
        }
        hide[col.value] = hideOn.trim();
      });

      columns.forEach(function (col) {
        if (col.$$hashKey) delete col.$$hashKey;
        if (!col.toggle) col.hideOn = hide[col.value];
      });

      return columns;
    };

    var openModal = function (id, modalConfig) {
      angular.element('#' + id).modal({
        keyboard: modalConfig.keyboard,
        backdrop: modalConfig.backdrop
      });

      // tooltip fixes
      angular.element('[data-toggle="tooltip-screen-size"]').tooltip();
    };

    var closeModal = function (id) {
      angular.element('#' + id).modal('hide');
    };

    var checkAllByScreenSize = function (screenSize, modalColumns, value, modalId) {
      var checkboxMaster = {};

      modalColumns.forEach(function (column) {
        column.hideOn[screenSize] = value;

        var selector = '#' + modalId + ' input#cbMaster-' + column.value;
        checkboxMaster[column.value] = defineMasterCheckboxState(selector, column);
      });

      return checkboxMaster;
    };

    return {
      getmodalId: getmodalId,
      initMasterCheckbox: initMasterCheckbox,
      defineMasterCheckboxState: defineMasterCheckboxState,
      updateColumnsVisibility: updateColumnsVisibility,
      checkAllByScreenSize: checkAllByScreenSize,
      getColumns: getColumns,
      openModal: openModal,
      closeModal: closeModal
    };
  }]);

angular.module('veasy.table')

  .service('paginationService', [ function () {

    var isFiniteNumber = function (index) {
      return !isNaN(index) && isFinite(index);
    };

    var paginate = function (list, pageSize) {
      if (!list) return [];

      var paginatedList = [];

      for (var i = 0; i < list.length; i++) {
        var pageIndex = i / pageSize;

        if (isFiniteNumber(pageIndex)) {
          if (i % pageSize === 0) {
            paginatedList[Math.floor(pageIndex)] = [list[i]];
          } else {
            paginatedList[Math.floor(pageIndex)].push(list[i]);
          }
        }
      }

      return paginatedList;
    };

    var pages = function (totalPages, initialPage, range) {
      if (initialPage > totalPages - range)
        initialPage = totalPages - range + 1;

      var result = [];
      for (var i = initialPage; i < initialPage + range; i++) {
        if (i >= 0) result.push(i);
      }

      return result;
    };

    return {
      paginate: paginate,
      pages: pages
    };

  }]);

angular.module('veasy.table')

  .service('screenService', ['$window', function($window) {

    var getViewport = function(id) {
      var body = angular.element('div > #' + id).parent();
      var screen = $window.screen;
      return isMobile() ? { width: screen.width, height: screen.height } : { width: body.width(), height: body.height() };
    };

    var getVeasyTable = function(id) {
      var vp = getViewport(id);
      var table = angular.element('table#' + id);
      var offset = {
        top: table.offset().top,
        left: table.offset().left
      }
      return { width: table.width(), height: table.height(), offset: offset };
    };

    var isBrokenLayout = function(id) {
      var vt = getVeasyTable(id);
      var vp = getViewport(id);
      return vt.width > vp.width;
    };

    var isMobile = function() {
      var check = false;
      (function(a,b){
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))
          check = true;
        })(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    };

    var getScreenSize = function() {
      var width = isMobile() ? $window.screen.width : angular.element('body').width();
      if (width < 768) return 'xs';
      if (width >= 768 && width < 992) return 'sm';
      if (width >= 992 && width < 1200) return 'md';
      if (width >= 1200) return 'lg';
    };

    var isNeedToHide = function(hideColumnOn) {
      if (hideColumnOn && (hideColumnOn.indexOf(getScreenSize()) !== -1)) return true;
      return false;
    };

    return {
      screenSize: getScreenSize,
      veasyTable: getVeasyTable,
      isBrokenLayout: isBrokenLayout,
      isNeedToHide: isNeedToHide
    };
  }]);

angular.module('veasy.table')

  .service('searchService', ['$filter', function ($filter) {

    var defineFilterColumnsDropdown = function (columns, labels) {
      var array = [{ header: labels.filter.all, value: 'all' }];

      columns.forEach(function (column, index) {
        if (!column.toggle)
          array.push(column);
      });

      return array;
    };

    var search = function (terms, condition, column, list) {
      return $filter('filter')(list, function (item) {
        var value = angular.lowercase(transformElementToLowerCaseString(column.value, item));
        var splittedTerms = angular.lowercase(terms).split(' ');

        if (condition === 'AND')
          return searchWithANDCondition(splittedTerms, value, column);

        if (condition === 'OR')
          return searchWithORCondition(splittedTerms, value, column);
      });
    };

    var searchWithANDCondition = function (terms, value, column) {
      return terms.every(function (term) {
        return compare(term, value, column);
      });
    };

    var searchWithORCondition = function (terms, value, column) {
      return terms.some(function (term) {
        return compare(term, value, column);
      });
    };

    var compare = function (term, value, column) {
      var type = column.filter ? column.filter.type : '';

      if(type === 'date') return compareTo.date(term, value, column.filter);
      if(type === 'currency') return compareTo.number(term, value);
      if(type === 'number') return compareTo.number(term, value);
      // if(type === 'json') return; // TODO: Implementar

      return compareTo.string(term, value);
    };

    var compareTo = {
      string: function (term, value) {
        return value.indexOf(term) !== -1;
      },
      number: function (term, value) {
        return value.toString().indexOf(term) !== -1;
      },
      date: function (term, value, filter) {
        var filteredValue = $filter('date')(value, filter.format, filter.timezone);
        return filteredValue.indexOf(term) !== -1;
      }
    };

    // FIXME: Melhorar
    var transformElementToLowerCaseString = function (column, item) {
      if (item.$$hashKey) delete item.$$hashKey;
      if (column !== 'all') return item[column] || '';

      var str = '';
      for (var prop in item) {
        str += item[prop] + ' ';
      }
      return str;
    };

    return {
      getColumnsDropdown: defineFilterColumnsDropdown,
      search: search
    };

  }]);

angular.module('veasy.table')

  .service('vetService', ['$window', function($window) {



    return {
      
    };
  }]);

angular.module('veasy.table')

  .directive('veasyTable', ['$templateCache', '$window', '$filter', '$timeout', 'screenService', 'paginationService', 'searchService', 'checkboxService', 'columnService', 'configService', 'modalService', function ($templateCache, $window, $filter, $timeout, screenService, paginationService, searchService, checkboxService, columnService, configService, modalService) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'template.html',
      scope: {
        config: '=',
        list: '='
      },
      link: function (scope, element, attributes, controller) {

        var init = function () {
          scope.config = configService.validate(scope.config);
          scope.vetModalId = modalService.getmodalId(scope.config.id);
          scope.filterColumnsList = searchService.getColumnsDropdown(scope.config.columns, scope.config.labels);
          scope.selectedColumn = scope.filterColumnsList[0];
          scope.condition = 'AND';
          scope.searching = false;

          scope.master = {
            checkbox: false,
            expanded: false
          };

          scope.checkboxes = [];
          scope.expanded = [];
          scope.resultList = [];

          registerEvents();
          enableFeatures(scope.config);
          updateVeasyTable();
        };

        var enableFeatures = function (config) {
          if (config.toggleColumns.enable)
            addToggleIcon(scope.config);

          if (config.columnFilter.enable && config.columnFilter.modalOptions.autoOpen) {
            $timeout(function () {
              scope.openColumnFilterModal(config.columns);
            }, 0);
          }
        };

        /**
         * Registra os eventos.
         */
        var registerEvents = function () {

          scope.$watch('list', function (result) {
            if (!result) return;

            scope.resultList = angular.copy(result);
            scope.filteredList = angular.copy(result);
            paginate(scope.filteredList, scope.config.pagination.itemsPerPage, 0);
          });

          scope.$watch('config.columns', function (result) {
            if (!result) return;

            $timeout(function () {
              $window.dispatchEvent(new Event('resize'));
            }, 0);
          }, true);

          $window.addEventListener('resize', function () {
            scope.updatingTableColumns = true;
            scope.outOfBound = false;

            scope.$apply(function () {
              $timeout(function () {
                if (screenService.isBrokenLayout(scope.config.id)) scope.outOfBound = true;

                updateVeasyTable();
                updateAllHiddenRowsContent();

                $timeout(function () {
                  scope.updatingTableColumns = false;
                }, 500);
              }, 0);
            });
          });
        };

        scope.getTBodyStyle = function () {
          var element = angular.element('table#' + scope.config.id);
          var tfootHeight = angular.element('table#' + scope.config.id + ' > tfoot').height();
          var obj = {};

          if (element) {
            obj['width'] = element.width() ? element.width() + 'px' : '0px';
            obj['height'] = element.height() ? element.height() - tfootHeight + 1 + 'px' : '0px';
            if (element.position()) {
              obj['top'] = element.position().top ? element.position().top + 'px' : '0px';
              obj['left'] = element.position().left ? element.position().left + 'px' : '0px';
            }
          }

          return obj;
        };

        var updateVeasyTable = function () {
          scope.toggleRowColspan = columnService.defineToggleRowColspan(scope.config.columns);
          columnService.closeAllOpenedRows(scope.resultList);
        };
        /** --------------------------------------------------------------------
         *                         Column Filter (Modal)
         * ------------------------------------------------------------------ */

        scope.openColumnFilterModal = function (columns) {
          scope.modalColumns = modalService.getColumns(columns);
          scope.modalCheckboxMaster = modalService.initMasterCheckbox(scope.vetModalId, scope.modalColumns);

          modalService.openModal(scope.vetModalId, scope.config.columnFilter.modalOptions);
        };

        scope.checkWindowSize = function (column) {
          var selector = '#' + scope.vetModalId + ' input#cbMaster-' + column.value;
          scope.modalCheckboxMaster[column.value] = modalService.defineMasterCheckboxState(selector, column);
        };

        scope.checkWindowSizeMaster = function (column, masterValue) {
          for (var prop in column.hideOn) {
            column.hideOn[prop] = masterValue;
          }
        };

        scope.checkAllByScreenSize = function (size, modalColumns, value) {
          if (!scope.screenSize) scope.screenSize = {};
          scope.screenSize[size] = !value;
          scope.modalCheckboxMaster = modalService.checkAllByScreenSize(size, modalColumns, scope.screenSize[size], scope.vetModalId);
        };

        scope.onConfirmColumnFilterModal = function (data) {
          scope.config.columns = modalService.updateColumnsVisibility(scope.config.columns, data);
          delete scope.modalColumns;

          modalService.closeModal(scope.vetModalId);
          scope.$emit('veasyTable:onApplyColumnFilter', angular.copy(scope.config.columns));
        };

        /** --------------------------------------------------------------------
         *                            User Events
         * ------------------------------------------------------------------ */
        scope.onClickRow = function (row) {
          var copyRow = angular.copy(row);
          delete copyRow.$$hashKey;

          scope.$emit('veasyTable:onClickRow', copyRow);
        };

        /** --------------------------------------------------------------------
         *                            Checkboxes
         * ------------------------------------------------------------------ */
        scope.checkAllPageRows = function (currentPage, checkboxMaster) {
          if (!scope.checkboxes[currentPage]) scope.checkboxes[currentPage] = {};

          for (var i = 0; i < scope.checkboxes[currentPage].length; i++) {
            scope.checkboxes[currentPage][i] = checkboxMaster;
          }
        };

        scope.checkRow = function (event, currentPage, rowIndex) {
          event.stopPropagation();
          if (!scope.checkboxes[currentPage]) scope.checkboxes[currentPage] = {};
          if (!scope.checkboxes[currentPage][rowIndex]) scope.checkboxes[currentPage][rowIndex] = !!scope.checkboxes[currentPage][rowIndex];
          defineCheckboxMasterState(currentPage);
        };

        var initCheckboxes = function (paginatedList) {
          scope.checkboxes = checkboxService.reset(paginatedList);
        };

        var defineCheckboxMasterState = function (currentPage) {
          var selector = '#' + scope.config.id + ' input#checkbox-master';
          scope.master.checkbox = checkboxService.defineCheckboxMasterState(selector, scope.checkboxes, currentPage);
        };

        /** --------------------------------------------------------------------
         *                            Sort
         * ------------------------------------------------------------------ */

        scope.sort = function (predicate) {
          scope.$emit('veasyTable:onStartSort');

          if (scope.predicate === predicate)
            scope.reverse = !scope.reverse;

          scope.predicate = predicate;

          if (scope.predicate !== '') {
            var list = $filter('orderBy')(scope.filteredList, scope.predicate, scope.reverse);
            paginate(list, scope.config.pagination.itemsPerPage, 0);
          }

          scope.$emit('veasyTable:onEndSort');
        };

        scope.defineSortableIcon = function (direction, columnName) {
          return {
            'fa-sort': changeSortableDirection('', columnName),
            'fa-sort-asc': changeSortableDirection('asc', columnName),
            'fa-sort-desc': changeSortableDirection('desc', columnName)
          }
        };

        var changeSortableDirection = function (direction, predicate) {
          if (direction === 'asc') return scope.predicate === predicate && !scope.reverse;
          if (direction === 'desc') return scope.predicate === predicate && scope.reverse;
          return true;
        };

        /** --------------------------------------------------------------------
         *                            Search
         * ------------------------------------------------------------------ */

        scope.selectFilterColumn = function (terms, condition, col) {
          scope.selectedColumn = col;
          if (terms)
            scope.search(terms, condition, col);
        };

        scope.changeSearchCondition = function (terms, condition, selectedColumn) {
          scope.condition = condition;
          if (terms)
            scope.search(terms, condition, selectedColumn);
        }

        scope.search = function (terms, condition, column) {
          if (!condition || !column) return;
          scope.searching = true;

          if (scope.queryBusy) {
            $timeout.cancel(scope.queryBusy);
          } else {
            scope.$emit('veasyTable:onStartSearch');
          }

          scope.queryBusy = $timeout(function () {
            scope.filteredList = searchService.search(terms || '', condition, column, scope.resultList);
            paginate(scope.filteredList, scope.config.pagination.itemsPerPage, 0);
            scope.searching = false;

            scope.$emit('veasyTable:onEndSearch');
          }, scope.config.filter.delay);
        };

        /** --------------------------------------------------------------------
         *                          Data Filters
         * ------------------------------------------------------------------ */

        scope.isUrl = function (column) {
          return column.filter.type === 'url';
        };

        scope.applyFilter = function (value, filter) {
          if (filter.type === 'currency') return $filter('currency')(value, filter.symbol, filter.fractionSize);
          if (filter.type === 'date') return $filter('date')(value, filter.format, filter.timezone);
          if (filter.type === 'json') return $filter('json')(value, filter.spacing);
          if (filter.type === 'url') return $filter('url')(value, filter.text, filter.target);
          if (filter.type === 'number') return $filter('number')(value, filter.fractionSize);
          if (filter.type === 'limitTo') return $filter('limitTo')(value, filter.limit, filter.begin);
          if (filter.type === 'lowercase') return $filter('lowercase')(value);
          if (filter.type === 'uppercase') return $filter('uppercase')(value);
          return value;
        };

        /** --------------------------------------------------------------------
         *                            Pagination
         * ------------------------------------------------------------------ */

        scope.changeItemsPerPage = function (itemsPerPage) {
          paginate(scope.filteredList, itemsPerPage, 0);
        };

        scope.setPage = function (page) {
          scope.currentPage = page;
          scope.pages = paginationService.pages(scope.paginatedList.length - 1, page, 5);

          // $timeout(function () {
          scope.expanded = [];
          scope.master.expanded = false;
          initHiddenRowsContent();
          // delete scope.master.checkbox;
          defineCheckboxMasterState(scope.currentPage);
          // }, 0);
        };

        scope.nextPage = function () {
          if (scope.currentPage < scope.paginatedList.length - 1) scope.setPage(scope.currentPage + 1);
        };

        scope.previousPage = function () {
          if (scope.currentPage > 0) scope.setPage(scope.currentPage - 1);
        };

        scope.isNextPageDisabled = function (list) {
          if (!list) return;
          return scope.currentPage === (list.length - 1);
        };

        scope.isPreviousPageDisabled = function () {
          return scope.currentPage === 0;
        };

        var paginate = function (list, pageSize, initialPage) {
          if (!scope.config.pagination.enable) {
            scope.paginatedList = [list];
            scope.currentPage = 0;
            return;
          };
          scope.$emit('veasyTable:onStartPagination');
          scope.paginatedList = paginationService.paginate(list, pageSize);
          scope.setPage(initialPage);
          initCheckboxes(scope.paginatedList);
          scope.$emit('veasyTable:onEndPagination');
        };

        /** --------------------------------------------------------------------
         *                          Responsivity
         * ------------------------------------------------------------------ */

        var initHiddenRowsContent = function () {
          if (!scope.hiddenContent) scope.hiddenContent = [];
          if (!scope.hiddenContent[scope.currentPage || 0]) scope.hiddenContent[scope.currentPage || 0] = [];
        };

        var updateHiddenRowsContent = function (rowIndex, row) {
          initHiddenRowsContent();
          scope.hiddenContent[scope.currentPage][rowIndex] = columnService.getHiddenContent(row, scope.config.columns);
        };

        var updateAllHiddenRowsContent = function () {
          if (!scope.paginatedList || !scope.paginatedList[scope.currentPage]) return;

          for (var i = 0; i < scope.paginatedList[scope.currentPage].length; i++) {
            updateHiddenRowsContent(i, scope.paginatedList[scope.currentPage][i]);
          }
        };

        scope.initToggleButton = function (rowIndex, row) {
          scope.expanded[rowIndex] = false;
          updateHiddenRowsContent(rowIndex, row);
        };

        scope.toggleRow = function (event, rowIndex, row) {
          event.stopPropagation();
          scope.expanded[rowIndex] = !scope.expanded[rowIndex];
        };

        scope.showToggleIcon = function (column) {
          return scope.config.toggleColumns && scope.config.toggleColumns.enable && column.toggle && scope.haveHiddenColumn(scope.config.columns);
        };

        scope.toggleAllRows = function () {
          scope.master.expanded = !scope.master.expanded;

          if (scope.master.expanded) {
            openAllClosedRows();
          } else {
            closeAllOpenedRows();
          }
        };

        var openAllClosedRows = function () {
          for (var i = 0; i < scope.expanded.length; i++) {
            scope.expanded[i] = true;
          }
        };

        var closeAllOpenedRows = function () {
          for (var i = 0; i < scope.expanded.length; i++) {
            scope.expanded[i] = false;
          }
        };

        scope.showToggleHeader = function (column) {
          return !column.toggle || (column.toggle && scope.haveHiddenColumn(scope.config.columns));
        };

        scope.haveHiddenColumn = function (columns) {
          return columnService.haveHiddenColumn(columns);
        };

        scope.getToggleIconClasses = function (config, openCondition, closeCondition) {
          var icons = {};
          icons[config.toggleColumns.icons.closed] = closeCondition;
          icons[config.toggleColumns.icons.opened] = openCondition;
          return icons;
        };

        var addToggleIcon = function (config) {
          if (config.toggleColumns.position === 'begin') {
            config.columns.unshift({ header: '', value: 'toggle', hideOn: '', toggle: true });
          } else {
            config.columns.push({ header: '', value: 'toggle', hideOn: '', toggle: true });
          }
        };

        scope.getColumnStyle = function (column) {
          if (column.toggle)
            return { 'width': '37px', 'text-align': 'center' };

          // Hackfix to work ellipsis
          if (scope.outOfBound)
            return { 'max-width': '1px', 'min-width': '1px' };

          return {};
        };

        var calculateMaxWidth = function () {
          var filteredColumns = scope.config.columns.filter(function (column) {
            return !column.toggle && !column.isHidden;
          }) || [];
          return (screenService.veasyTable().width/filteredColumns.length) + 'px';
        };

        scope.responsiveHiddenContentStyle = function () {
          var screenSize = screenService.screenSize();
          if (screenSize === 'lg') return { 'max-width': '1060px' };
          if (screenSize === 'md') return { 'max-width': '860px' };
          if (screenSize === 'sm') return { 'max-width': '660px' };
          if (screenSize === 'xs') return { 'max-width': '260px' };
          return {};
        };

        scope.hideColumnOn = function (column, hideColumnOn) {
          if (!screenService.isNeedToHide(hideColumnOn)) {
            delete column.isHidden;
            return false;
          }

          column.isHidden = true;
          return true;
        };


        /** --------------------------------------------------------------------
         *                          Initialize
         * ------------------------------------------------------------------ */

        init();
      }
    }
  }]);
