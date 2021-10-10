function Validator(options) {
    var selectorRules = {};

    function validate(inputElement, rule) {
        var errElement = inputElement.parentElement.querySelector(options.errorSelector);
        var errMessage;
        var rules = selectorRules[rule.selector];
        for (var i = 0; i < rules.length; ++i) {
            errMessage = rules[i](inputElement.value);
            if (errMessage) break;
        }
        if (errMessage) {
            errElement.innerText = errMessage;
            inputElement.parentElement.classList.add('invalid')
        } else {
            errElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid')
        }
        return !errMessage;
    }




    var formElement = document.querySelector(options.form);
    if (formElement) {
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });


            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        return (values[input.name] = input.value) && values
                    }, {});

                    options.onSubmit(formValues);
                }
            }
        }



        options.rules.forEach(function(rule) {


            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }


            var inputElement = formElement.querySelector(rule.selector);

            if (inputElement) {
                inputElement.onblur = function() {
                    validate(inputElement, rule)
                }
                inputElement.oninput = function() {
                    var errElement = inputElement.parentElement.querySelector(options.errorSelector);
                    errElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid')
                }
            }
        });

    }
}
Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}
Validator.isEmail = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email';
        }
    }
}
Validator.minLength = function(selector, min) {
    return {
        selector: selector,
        test: function(value) {

            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`;
        }
    }
}
Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị không chính xác';
        }
    }
}