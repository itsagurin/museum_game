import numpy as np
from PIL import Image
from src.content_sources import difference_hash, find_source, queries


def test_queries_include_english_and_name_variants():
    result = queries({"artist":"Jan Piotr Norblin", "title":{"pl":"Sejmik", "en":"Assembly in a church"}})
    assert "Norblin Assembly in a church" in result
    assert "Jean Pierre Norblin Assembly in a church" in result
    assert len(result) == len(set(result))


def test_only_matching_images_receive_a_source():
    original = Image.fromarray(np.tile(np.arange(64,dtype=np.uint8), (64,1)))
    class FakeCommons:
        def search(self, query): return ["File:test.png"]
        def details(self, titles): return [{"title":"File:test.png", "imageinfo":[{"width":64,"height":64,"url":"https://example.org/image", "descriptionurl":"https://example.org/page", "extmetadata":{"LicenseShortName":{"value":"Public domain"}}}]}]
        def thumbnail(self,url): return original
    entry={"artist":"Painter", "title":{"pl":"Title","en":"Title"}}
    source=find_source(FakeCommons(),entry,difference_hash(original),1)
    assert source["match"] == "image"
    assert source["_distance"] == 0
    assert find_source(FakeCommons(),entry,~difference_hash(original),1) is None
