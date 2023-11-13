import path from "path";
import { URLSearchParams } from "url";
import { createObjectFromTuples, dateToIsoDate } from "./utils";

enum ResponseTypeEnum {
  OBJECT,
  JSON,
  XML,
};

enum OrderByEnum {
  SERIES_ID = 'series_id',
  TITLE = 'title',
  UNITS = 'units',
  FREQUENCY = 'frequency',
  SEASONAL_ADJUSTMENT = 'seasonal_adjustment',
  REALTIME_START = 'realtime_start',
  REALTIME_END = 'realtime_end',
  LAST_UPDATED = 'last_updated',
  OBSERVATION_START = 'observation_start',
  OBSERVATION_END = 'observation_end',
  POPULARITY = 'popularity',
  GROUP_POPULARITY = 'group_popularity',
};

enum SortOrderEnum {
  ASCENDING = 'ascending',
  DESCENDING = 'descending',
};

enum FilterAttributeEnum {
  FREQUENCY = 'frequency',
  UNITS = 'units',
  SEASONAL_ADJUSTMENT = 'seasonal_adjustment',
};

enum TagGroupIDEnum {
  FREQUENCY = 'freq',
  GENERAL_OR_CONCEPT = 'gen',
  GEOGRAPHY = 'geo',
  GEOGRAPHY_TYPE = 'geot',
  RELEASE = 'rls',
  SEASONAL_ADJUSTMENT = 'seas',
  SOURCE = 'src',
};

interface ISimpleFredResponse {
  status: number,
  content: any,
  error?: any,
};

class FredAPI {
  baseurl: string;
  apikey: string;

  constructor(apikey: string|null = null, baseurl: string = 'https://api.stlouisfed.org') {
    this.baseurl = baseurl;
    this.apikey = apikey || '';
  }

  setApiKey(apiKey: string) {
    this.apikey = apiKey;
  }

  setBaseUrl(baseurl: string) {
    this.baseurl = baseurl
  }

  getFredUrl(url: string) {
    return path.join(this.baseurl, url);
  }

  async doSimpleFredRequest(uri: string, method: string, getParams: URLSearchParams, respType: ResponseTypeEnum = ResponseTypeEnum.OBJECT): Promise<ISimpleFredResponse> {
    let resp: Response;
    if (getParams) {
      getParams.append('file_type', {
        [ResponseTypeEnum.OBJECT]: 'json',
        [ResponseTypeEnum.JSON]: 'json',
        [ResponseTypeEnum.XML]: 'xml',
      }[respType]);
      getParams.append('api_key', this.apikey);
    }

    try {
      resp = await fetch(`${this.getFredUrl(uri)}?${getParams.toString()}`, {
        method: 'GET',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
      });

      if (resp.ok) {
        return {
          status: resp.status,
          content: (respType === ResponseTypeEnum.OBJECT) ? await resp.json() : await resp.arrayBuffer(),
        };
      } else {
        return {
          status: resp.status,
          content: null,
          error: 'fetch error',
        };
      }
    } catch (e) {
      return {
        status: -1,
        content: null,
        error: e,
      }
    }
  }

  async getCategory(
    category_id: string,
    respType: ResponseTypeEnum = ResponseTypeEnum.OBJECT
  ) {
    return await this.doSimpleFredRequest(
      '/fred/category',
      'GET',
      new URLSearchParams({ category_id }),
      respType
    );
  }

  async getCategoryChildren(
    category_id: string,
    realtime_start: Date | null = null,
    realtime_end: Date | null = null,
    respType: ResponseTypeEnum = ResponseTypeEnum.OBJECT
  ) {
    const params = createObjectFromTuples([
      ['category_id', category_id],
      ['realtime_start', dateToIsoDate(realtime_start)],
      ['realtime_end', dateToIsoDate(realtime_end)]
    ]);

    return await this.doSimpleFredRequest(
      '/fred/category/children',
      'GET',
      new URLSearchParams(params),
      respType,
    );
  }

  async getCategoryRelated(
    category_id: string,
    realtime_start: Date | null = null,
    realtime_end: Date | null = null,
    respType: ResponseTypeEnum = ResponseTypeEnum.OBJECT
  ) {
    const params = createObjectFromTuples([
      ['category_id', category_id],
      ['realtime_start', dateToIsoDate(realtime_start)],
      ['realtime_end', dateToIsoDate(realtime_end)]
    ]);

    return await this.doSimpleFredRequest(
      '/fred/category/related',
      'GET',
      new URLSearchParams(params),
      respType,
    );
  }

  async getCategorySeries(
    category_id: string,
    offset: number,
    limit: number,
    filter_variable: FilterAttributeEnum | null = null,
    filter_value: string | null = null,
    tag_names: string | null = null,
    exclude_tag_names: string | null = null,
    order_by: OrderByEnum | null = null,
    sort_order: SortOrderEnum | null = null,
    realtime_start: Date | null = null,
    realtime_end: Date | null = null,
    respType: ResponseTypeEnum = ResponseTypeEnum.OBJECT
  ) {
    const params = createObjectFromTuples([
      ['category_id', category_id],
      ['offset', offset.toString()],
      ['limit', limit.toString()],
      ['filter_variable', filter_variable],
      ['filter_value', filter_value],
      ['tag_names', tag_names],
      ['exclude_tag_names', exclude_tag_names],
      ['sort_order', sort_order],
      ['order_by', order_by],
      ['realtime_start', dateToIsoDate(realtime_start)],
      ['realtime_end', dateToIsoDate(realtime_end)],
    ]);
    
    return await this.doSimpleFredRequest(
      '/fred/category/series',
      'GET',
      new URLSearchParams(params),
      respType
    );
  }

  async getCategoryTags(
    category_id: string,
    offset: number,
    limit: number,
    tag_names: string | null = null,
    tag_group_id: TagGroupIDEnum | null = null,
    search_text: string | null = null,
    order_by: OrderByEnum | null = null,
    sort_order: SortOrderEnum | null = null,
    realtime_start: Date | null = null,
    realtime_end: Date | null = null,
    respType: ResponseTypeEnum = ResponseTypeEnum.OBJECT
  ) {
    const params = createObjectFromTuples([
      ['category_id', category_id],
      ['offset', offset.toString()],
      ['limit', limit.toString()],
      ['realtime_start', dateToIsoDate(realtime_start)],
      ['realtime_end', dateToIsoDate(realtime_end)],
      ['tag_names', tag_names],
      ['tag_group_id', tag_group_id],
      ['search_text', search_text],
      ['order_by', order_by],
      ['sort_order', sort_order],
    ]);

    return await this.doSimpleFredRequest(
      '/fred/category/tags',
      'GET',
      new URLSearchParams(params),
      respType
    );
  }

  async getCategoryRelatedTags(
    category_id: string,
    offset: number,
    limit: number,
    tag_names: string | null = null,
    exclude_tag_names: string | null = null,
    tag_group_id: TagGroupIDEnum | null = null,
    search_text: string | null = null,
    order_by: OrderByEnum | null = null,
    sort_order: SortOrderEnum | null = null,
    realtime_start: Date | null = null,
    realtime_end: Date | null = null,
    respType: ResponseTypeEnum = ResponseTypeEnum.OBJECT
  ) {
    const params = createObjectFromTuples([
      ['category_id', category_id],
      ['offset', offset.toString()],
      ['limit', limit.toString()],
      ['realtime_start', dateToIsoDate(realtime_start)],
      ['realtime_end', dateToIsoDate(realtime_end)],
      ['sort_order', sort_order],
      ['order_by', order_by],
      ['search_text', search_text],
      ['tag_names', tag_names],
      ['exclude_tag_names', exclude_tag_names],
      ['tag_group_id', tag_group_id],
    ]);

    return this.doSimpleFredRequest(
      '/fred/category/related_tags',
      'GET',
      new URLSearchParams(params),
      respType
    );
  }

  async getReleases(
    offset: number,
    limit: number,
    order_by: OrderByEnum | null = null,
    sort_order: SortOrderEnum | null = null,
    realtime_start: Date | null = null,
    realtime_end: Date | null = null,
    respType: ResponseTypeEnum = ResponseTypeEnum.OBJECT
  ) {
    const params = createObjectFromTuples([
      ['offset', offset.toString()],
      ['limit', limit.toString()],
      ['realtime_start', dateToIsoDate(realtime_start)],
      ['realtime_end', dateToIsoDate(realtime_end)],
      ['sort_order', sort_order],
      ['order_by', order_by],
    ]);

    return this.doSimpleFredRequest(
      '/fred/releases',
      'GET',
      new URLSearchParams(params),
      respType
    );
  }

  async getReleaseDates(
    offset: number,
    limit: number,
    includeReleaseDatesWithNoData: boolean = false,
    order_by: OrderByEnum | null = null,
    sort_order: SortOrderEnum | null = null,
    realtime_start: Date | null = null,
    realtime_end: Date | null = null,
    respType: ResponseTypeEnum = ResponseTypeEnum.OBJECT
  ) {
    const params = createObjectFromTuples([
      ['offset', offset.toString()],
      ['limit', limit.toString()],
      ['realtime_start', dateToIsoDate(realtime_start)],
      ['realtime_end', dateToIsoDate(realtime_end)],
      ['sort_order', sort_order],
      ['order_by', order_by],
      ['include_release_dates_with_no_data', includeReleaseDatesWithNoData ? 'true' : 'false'],
    ]);

    return this.doSimpleFredRequest(
      '/fred/releases/dates',
      'GET',
      new URLSearchParams(params),
      respType
    );
  }

  async getReleaseSeries(
    release_id: string,
    offset: number,
    limit: number,
    order_by: OrderByEnum | null = null,
    sort_order: SortOrderEnum | null = null,
    filter_by: FilterAttributeEnum | null = null,
    filter_value: string | null = null,
    tag_names: string | null,
    realtime_start: Date | null = null,
    realtime_end: Date | null = null,
    respType: ResponseTypeEnum = ResponseTypeEnum.OBJECT
  ) {
    const params = createObjectFromTuples([
      ['release_id', release_id],
      ['offset', offset.toString()],
      ['limit', limit.toString()],
      ['realtime_start', dateToIsoDate(realtime_start)],
      ['realtime_end', dateToIsoDate(realtime_end)],
      ['sort_order', sort_order],
      ['order_by', order_by],      
    ])
  }

  async getReleaseSources() {
  }

  async getReleaseTags() {
  }

  async getReleaseRelatedTags() {
  }

  async getReleaseTables() {
  }

  async getSeries() {
  }

  async getSeriesCategories() {
  }

  async getSeriesObservations() {
  }

  async getSeriesSearch() {
  }

  async getSeriesSearchTags() {
  }

  async getSeriesSearchRelatedTags() {
  }

  async getSeriesTags() {
  }

  async getSeriesUpdates() {
  }

  async getSeriesVintageDates() {
  }
}

export default FredAPI;
