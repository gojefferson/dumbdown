import pathlib

from setuptools import setup

# The directory containing this file
HERE = pathlib.Path(__file__).parent

# The text of the README file
README = (HERE / "README.md").read_text()

# This call to setup() does all the work
setup(
    name="dumbdown",
    version="1.0.0",
    description="*Extremely* _simple_ markdown-ish format",
    long_description=README,
    long_description_content_type="text/markdown",
    python_requires=">= 3.7",
    url="https://github.com/LAWPRCT/dumbdown",
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
    # install_requires=["python-docx"],
)
