import scrapy


class JobItem(scrapy.Item):
    external_id = scrapy.Field()
    title = scrapy.Field()
    location = scrapy.Field()
    employment_type = scrapy.Field()
    job_url = scrapy.Field()
    company_name = scrapy.Field()
    career_page_url = scrapy.Field()
