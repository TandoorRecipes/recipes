/*
* Utility functions to use OpenAPIs generically
* */
import {ApiApiFactory} from "@/utils/openapi/api.ts";

import axios from "axios";
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"

export class GenericAPI {
    constructor(model, action) {
      this.model = model;
      this.action = action;
      this.function_name = action + model
    }
}