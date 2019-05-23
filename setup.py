import pathlib

from setuptools import setup

HERE = pathlib.Path(__file__).parent

README = (HERE / "README.md").read_text()

setup(
    name="dumbdown",
    version="1.0.5",
    description="*Extremely* _simple_ markdown-ish format",
    long_description=README,
    long_description_content_type="text/markdown",
    python_requires=">= 3.7",
    url="https://github.com/gojefferson/dumbdown",
    author="Jeff Kerr",
    author_email="jeff@casefleet.com",
    license="MIT",
    classifiers=[
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
    ],
    packages=["dumbdown"],
    include_package_data=True,
)
