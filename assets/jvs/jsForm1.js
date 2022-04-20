// CONSTRUCTOR OBJECT `VALIDATOR`
function Validator(formSelector, options) {
    // Assign default value for parameters
    if (!options) {
        options = {}
    }

    // Take formElement in DOM according to `formSelector`
    var formElement = document.querySelector(formSelector)
    // Form contain rules
    var formRules = {}
    // Object contain function handle rules
    var validationRules = {
        // Create all keys/values pairs have name same the name rules
        // Standard common of rules: If have value put inner input return --> `undefined`
        // Reverse return --> `Message Error`
        required: function(value) {
            return value ? undefined : 'Required fill in the blank please!'
        },
        email: function(value) {
            // With the rules email need validate the data user put inner input is email type data
            var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            // Use method test() to search to weather the data correct is email or not
            return emailRegex.test(value) ? undefined : `Required fill an email please!`
        },
        min: function(min) {
            // Usage function nested function to get value and compare this value to min variable
            return function(value) {
                return value.length >= min ? undefined : `Fill least is ${min} words please`
            }
        },
        max: function(max) {
            return function(value) {
                return value.length <= max ? undefined : `Fill most is ${max} words please`
            }
        },
    }

    // Function usage handling get elementParent
    function getParent(input, selector) {
        var element = input.parentElement
        while (element) {
            var elementClass = element.classList
            for (var e of elementClass) {
                if (e === selector) {
                    return element
                }
            }
            element = element.parentElement
        }
    }
    
    // Check if form really existence will handle
    if (formElement) {
        // Take all input have a pair attributes is `name` && `rules`
        var inputs = formElement.querySelectorAll('[name][rules]')
        // Loop through the nodeList contain inputs
        // Cause nodeList have nature same an array we can usage the `loop of` loop
        
        for (var input of inputs) {
            // Convert value from attribute rules to array to handling it
            var rules = input.getAttribute('rules').split('|')
            for (var rule of rules) {
                // Call ruleInfo outside block code condition command sentence if/else to can use again it outside
                var ruleInfo
                var isRuleHasValue = rule.includes(':')
                
                // Usage condition command sentence to specified if have other character is (:)
                // Handle it by other way
                if (isRuleHasValue) {
                    var ruleInfo = rule.split(':')
                    rule = ruleInfo[0]
                }

                var ruleFunction = validationRules[rule]

                if (isRuleHasValue) {
                    ruleFunction = ruleFunction(ruleInfo[1])
                }
                
                // Put rules into the object formRules{}
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunction)
                } else {
                    formRules[input.name] = [ruleFunction]
                    // This object (formRules) description which rules inputs will get?
                    // Explain reason usage method getAttribute()
                    // Due to the `rules` is the attribute we define so it is invalid attribute
                    // So if want take value of the node attribute-invalid we need usage method getAttribute()
                    // formRules[input.name] = input.getAttribute('rules')
                }
            }

            // After handling all rules and the way validate
            // Need listen event on some node elements (like: onblur, onchange, ...)
            input.onblur = handleValidate
            input.oninput = handleClearError
        }
        
        // Function execute/perform validate for input
        function handleValidate(e) {
            // Use the some method to loop in rules. And if have a rule = true (has value)
            // Return and run this rule. Otherwise return errorMessage
            var errorMessage,
            input = e.target
            rules = formRules[input.name]

            rules.some(function (rule) {
                switch (input.type) {
                    case 'radio':
                    case 'checkbox':
                        errorMessage = rule(formElement.querySelector('[name]' + ':checked'))
                        return errorMessage
                    default:
                            errorMessage = rule(input.value)
                        return errorMessage
                        }
                    })

            // If have error errorMessage will appear out to the UI
            if (errorMessage) {
                var formGr = getParent(input, 'form-group')
                if (formGr) {
                    var formMess = formGr.querySelector('.form-message')
                    formGr.classList.add('invalid')
                    if (formMess) {
                        formMess.innerText = errorMessage
                    }
                }
            }
            return !errorMessage
        }

        function handleClearError(e) {
            // Usage for handling behavior fill value from user
            // The errorMessage will disappear
            var formGr = getParent(e.target, 'form-group')
            if (formGr.classList.contains('invalid')) {
                formGr.classList.remove('invalid')
                var formMess = formGr.querySelector('.form-message')

                if (formMess) {
                    formMess.innerText = ''
                }
            }
        }

        formElement.onsubmit = handleSubmit
        
        function handleSubmit(e) {
            e.preventDefault()
            var inputs = formElement.querySelectorAll('[name][rules]'),
            isValidate = true,
            isCheckedArray = {}

            for (var input of inputs) {
                // If we want reuse the validate method. We should put event object inner this arguments
                // Parameters of this method will get object is an event
                
                switch (input.type) {
                    case 'radio':
                    case 'checkbox':
                        // The Logic Is: Check if isCheckedArray don't have value code will perform method handleValidate
                        // Reverse just have a one value it will execute method handleClearError
                        if (input.matches(':checked')) {
                            if (!Array.isArray(input)) {
                                isCheckedArray[input.name] = input.value
                            } else {
                                isCheckedArray[input.name].push(input.value)
                            }
                        }
                        if (isCheckedArray[input.name]) {
                            handleClearError({target: input,})
                        } else {
                            handleValidate({target: input,})
                        }
                        break
                    default:
                        var resultValidate = handleValidate({
                            // In this case. The function need get the arguments is an event object to operation
                            // But it just need usage this obj for take the inputElement present (e.target)
                            // So we can take advantage creative the obj same that. This is obj with the key/value pair is the:
                            // Target is `key` and value is `input`. So if we usage the syntax e.target in this function
                            // It will have same feature
                            target: input,
                        })
                    }
                    if (!resultValidate) {
                        isValidate = false
                    }
            }

            if (isValidate) {
                if (typeof options.onSubmit === 'function') {
                    // Use the switch case to get the data
                    var enableForm = formElement.querySelectorAll('[name]')
                    var dataForm = Array.from(enableForm).reduce(function (values, input) {
                        // If use sentence condition: return (values[input.name] = input.value) && values
                        // If have value empty string --> convert to boolean will be false --> don't return object (values)
                        // Return empty --> error this code (logic)
                        // But spread them. The logic is: Always assign value/key pair for obj
                        // And always return obj(values) including case have a input don't fill (empty string/value)

                        // Take value of select/radio/checkbox with the logic:
                        switch(input.type) {
                            case 'radio':
                                // values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                // break
                                // Other logic with condition command sentence:
                                // This logic optimization than above logic. Cause it don't assign value three time
                                // Just don't matches selector it will break. (don't assign like above logic)
                                if (input.matches(':checked')) {
                                    values[input.name] = input.value
                                } else {
                                    break
                                }
                                // matches method is method of object node element
                                // the matches() method checks to see if the Element would be selected by the provided selectorString 
                                // in other words -- checks if the element "is" the selector. Return value is boolean type
                                // return value is boolean if selector string matches selector --> true. Reverse return false--> don't matches
                            case 'checkbox':
                                // MINE LOGIC:
                                // if (input.matches(':checked')) {
                                //     if (!Array.isArray(values[input.name])) {
                                //         values[input.name] = []
                                //     }
                                //     values[input.name].push(input.value)
                                //     return values
                                // } else {
                                //     break
                                // }
                                // OTHER LOGIC:
                                if (!input.matches(':checked')) {
                                    return values
                                }
                                // "break" keywords in this position same the "return values"
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break
                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        } 
                        return values
                    }, {})

                    if (dataForm) {
                        options.onSubmit(dataForm)
                    }

                } else {
                    formElement.onsubmit()
                }
            }
        }
    }
}