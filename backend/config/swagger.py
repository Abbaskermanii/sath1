from drf_yasg.generators import OpenAPISchemaGenerator


class NoPrefixSchemaGenerator(OpenAPISchemaGenerator):
    def determine_path_prefix(self, paths):
        return ''
