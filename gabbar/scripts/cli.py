# Skeleton of a CLI

import click

import gabbar


@click.command('gabbar')
@click.argument('changeset', type=int, metavar='N')
def cli(changeset):
    click.echo('Good')
